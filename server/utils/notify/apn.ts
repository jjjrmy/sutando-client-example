import type { H3Event } from 'h3';

// APN notification payload interface
export interface APNPayload {
    aps: {
        alert?: string | {
            title?: string;
            subtitle?: string;
            body?: string;
        };
        badge?: number;
        sound?: string | {
            critical?: number;
            name?: string;
            volume?: number;
        };
        'thread-id'?: string;
        category?: string;
        'content-available'?: number;
        'mutable-content'?: number;
        'target-content-id'?: string;
        'interruption-level'?: 'passive' | 'active' | 'time-sensitive' | 'critical';
        'relevance-score'?: number;
    };
    [key: string]: any; // Custom data
}

// Convert ECDSA DER signature to JOSE (r||s) for ES256 JWS
function derToJose(derSignature: ArrayBuffer, expectedSize = 64): string {
    const der = new Uint8Array(derSignature);
    let offset = 0;

    if (der[offset++] !== 0x30) throw new Error('Invalid DER: Expected sequence');
    const seqLen = der[offset++] & 0xff;
    if (seqLen + 2 !== der.length && !(seqLen & 0x80)) {
        // Non long-form lengths might still not match exactly; continue robustly
    }

    if (der[offset++] !== 0x02) throw new Error('Invalid DER: Expected integer (r)');
    let rLen = der[offset++] & 0xff;
    let r = der.slice(offset, offset + rLen);
    offset += rLen;

    if (der[offset++] !== 0x02) throw new Error('Invalid DER: Expected integer (s)');
    let sLen = der[offset++] & 0xff;
    let s = der.slice(offset, offset + sLen);

    // Remove leading zeros
    while (r[0] === 0x00 && r.length > 1) r = r.slice(1);
    while (s[0] === 0x00 && s.length > 1) s = s.slice(1);

    // Left pad with zeros to expected half size
    const half = expectedSize / 2;
    if (r.length > half || s.length > half) throw new Error('Invalid DER: r/s too long');
    const rPadded = new Uint8Array(half);
    rPadded.set(r, half - r.length);
    const sPadded = new Uint8Array(half);
    sPadded.set(s, half - s.length);

    const jose = new Uint8Array(expectedSize);
    jose.set(rPadded, 0);
    jose.set(sPadded, half);

    // Base64url encode
    let b64 = btoa(String.fromCharCode(...jose));
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return b64;
}

function base64urlFromBytes(bytes: Uint8Array): string {
    let b64 = btoa(String.fromCharCode(...bytes));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Generate JWT token for APN authentication
async function generateAPNToken(): Promise<string> {
    const teamId = process.env.APPLE_TEAM_ID!;
    const keyId = process.env.NOTIFY_APNS_KEY_ID!;
    const privateKey = process.env.NOTIFY_APNS_P8!;

    // Create JWT header
    const header = {
        alg: 'ES256',
        kid: keyId,
        typ: 'JWT'
    };

    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: teamId,
        iat: now,
        // exp not required by APNs; iat must be within last hour
    } as const;

    // Convert header and payload to base64url
    const encodedHeader = btoa(JSON.stringify(header))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    const encodedPayload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    // Prepare the signing input
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    // Import the private key for signing
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    let pemContents = privateKey;

    // Clean up the PEM string
    if (pemContents.includes(pemHeader)) {
        pemContents = pemContents.substring(
            pemContents.indexOf(pemHeader) + pemHeader.length
        );
    }
    if (pemContents.includes(pemFooter)) {
        pemContents = pemContents.substring(0, pemContents.indexOf(pemFooter));
    }

    // Remove whitespace and newlines
    pemContents = pemContents.replace(/\s/g, '');

    // Decode base64 to get the key data
    const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    // Import the key for signing
    const key = await crypto.subtle.importKey(
        'pkcs8',
        binaryKey,
        {
            name: 'ECDSA',
            namedCurve: 'P-256',
        },
        false,
        ['sign']
    );

    // Sign the token (ECDSA returns DER-encoded signature)
    const signature = await crypto.subtle.sign(
        {
            name: 'ECDSA',
            hash: 'SHA-256',
        },
        key,
        new TextEncoder().encode(signingInput)
    );

    // Auto-detect signature format: some runtimes return raw (r||s), others DER
    let joseSignature: string;
    const sigBytes = new Uint8Array(signature);
    if (sigBytes.length > 0 && sigBytes[0] === 0x30) {
        // DER sequence
        joseSignature = derToJose(signature, 64);
    } else {
        // Assume already raw (r||s)
        if (sigBytes.length !== 64) {
            throw new Error(`Unexpected ECDSA signature length: ${sigBytes.length}, expected 64 bytes for P-256`);
        }
        joseSignature = base64urlFromBytes(sigBytes);
    }

    // Construct the JWT
    return `${signingInput}.${joseSignature}`;
}

// Send APN notification
export async function notifyAPN(
    deviceToken: string,
    notification: APNPayload,
    options?: {
        priority?: number; // 5 (normal) or 10 (high)
        expiration?: number; // Unix timestamp
        collapseId?: string; // Notification grouping
        topic?: string; // Usually the bundle ID
        pushType?: 'alert' | 'background' | 'voip' | 'complication' | 'fileprovider' | 'mdm';
        development?: boolean; // Use sandbox environment
    },
    _retryToggledEnv?: boolean
): Promise<{ success: boolean; error?: string; apnsId?: string }> {
    const config = useRuntimeConfig();
    try {
        // Generate authentication token
        const authToken = await generateAPNToken();

        // Determine environment
        const isSandbox = options?.development === true ? true : options?.development === false ? false : false;
        const host = isSandbox
            ? 'https://api.sandbox.push.apple.com'
            : 'https://api.push.apple.com';

        // Prepare headers
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'apns-topic': options?.topic || config.public.appIdentifier!,
            'apns-push-type': options?.pushType || 'alert',
            'apns-priority': String(options?.priority || 10)
        };

        if (!headers['apns-topic']) {
            throw new Error('Missing apns-topic (bundle id). Ensure public.appIdentifier is set to your bundle id.');
        }

        if (options?.expiration) {
            headers['apns-expiration'] = String(options.expiration);
        }

        if (options?.collapseId) {
            headers['apns-collapse-id'] = options.collapseId;
        }

        console.log('APNs request', { host, topic: headers['apns-topic'], pushType: headers['apns-push-type'] });
        console.log('deviceToken', deviceToken);

        // Send the notification
        const response = await fetch(`${host}/3/device/${deviceToken}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(notification)
        });

        // Get the APNS ID from response headers
        const apnsId = response.headers.get('apns-id') || undefined;

        if (response.ok) {
            return {
                success: true,
                apnsId
            };
        }

        // Handle error response and log raw body
        let errorMessage = `APN request failed with status ${response.status}`;
        let rawBody = '';
        try {
            rawBody = await response.text();
            try {
                const json = JSON.parse(rawBody);
                if (json?.reason) errorMessage = `APN error: ${json.reason}`;
            } catch {
                if (response.statusText) errorMessage = `APN error: ${response.statusText}`;
            }
        } catch { }

        try {
            console.error('APN error response', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers as any),
                body: rawBody,
            });
        } catch { }

        // Common APN error status codes
        if (response.status === 400) {
            errorMessage = 'Bad request - invalid notification payload';
        } else if (response.status === 403) {
            errorMessage = 'Authentication error - check your APN credentials';
        } else if (response.status === 410) {
            errorMessage = 'Device token is no longer valid';
        } else if (response.status === 413) {
            errorMessage = 'Notification payload is too large';
        } else if (response.status === 429) {
            errorMessage = 'Too many requests - you are being rate limited';
        } else if (response.status === 500) {
            errorMessage = 'Internal server error at Apple';
        } else if (response.status === 503) {
            errorMessage = 'APN service is unavailable';
        }

        // Auto-fallback: If APNs reports BadDeviceToken and caller didn't explicitly set environment,
        // retry once against the other APNs host (sandbox <-> production)
        try {
            const parsed = rawBody ? JSON.parse(rawBody) : null;
            const reason = parsed?.reason as string | undefined;
            const envExplicit = typeof options?.development === 'boolean';
            if (reason === 'BadDeviceToken' && !envExplicit && !_retryToggledEnv) {
                const toggled = !isSandbox; // flip host
                console.warn('APNs BadDeviceToken; retrying on opposite environment', { fromSandbox: isSandbox, toSandbox: toggled });
                return await notifyAPN(deviceToken, notification, { ...options, development: toggled }, true);
            }
        } catch { }

        return {
            success: false,
            error: errorMessage,
            apnsId
        };
    } catch (error) {
        console.error('APN notification error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send APN notification'
        };
    }
}

// Helper function to create a basic alert notification
export function createAPNAlert(
    title: string,
    body: string,
    customData?: Record<string, any>
): APNPayload {
    return {
        aps: {
            alert: {
                title,
                body
            },
            sound: 'default'
        },
        ...customData
    };
}

// Helper function to create a silent notification
export function createAPNSilentNotification(
    customData?: Record<string, any>
): APNPayload {
    return {
        aps: {
            'content-available': 1
        },
        ...customData
    };
}
