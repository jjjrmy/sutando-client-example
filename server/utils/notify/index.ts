import ContactMethod from '../../../models/ContactMethod';
import { ContactMethodType } from '../../../models/ContactMethodType';
import { notifyAPN, createAPNAlert, type APNPayload } from './apn';

// Generic notification options
export interface NotificationOptions {
    title?: string;
    body?: string;
    data?: Record<string, any>;
    badge?: number;
    sound?: string | boolean;
    priority?: 'normal' | 'high';
    ttl?: number; // Time to live in seconds
}

// Notification result
export interface NotificationResult {
    success: boolean;
    provider: string;
    error?: string;
    details?: any;
}

/**
 * Send a notification to a user through their registered contact method
 */
export async function notify(
    contactMethodId: number | string,
    options: NotificationOptions
): Promise<NotificationResult> {
    // Fetch the contact method from database
    const contactMethod = await ContactMethod.query().find(contactMethodId);

    if (!contactMethod) {
        return {
            success: false,
            provider: 'unknown',
            error: 'Contact method not found'
        };
    }

    // Check if the contact method has expired
    if (contactMethod.expires_at && new Date(contactMethod.expires_at) < new Date()) {
        return {
            success: false,
            provider: contactMethod.type,
            error: 'Contact method has expired'
        };
    }

    // Route to appropriate provider
    switch (contactMethod.type) {
        case ContactMethodType.PUSH:
            return notifyPush(contactMethod, options);

        case ContactMethodType.EMAIL:
            return notifyEmail(contactMethod, options);

        case ContactMethodType.PHONE:
        case ContactMethodType.WHATSAPP:
            return notifyPhone(contactMethod, options);

        case ContactMethodType.WEBHOOK:
            return notifyWebhook(contactMethod, options);

        case ContactMethodType.SLACK:
            return notifySlack(contactMethod, options);

        case ContactMethodType.DISCORD:
            return notifyDiscord(contactMethod, options);

        case ContactMethodType.TELEGRAM:
            return notifyTelegram(contactMethod, options);

        default:
            return {
                success: false,
                provider: contactMethod.type,
                error: `Unsupported notification type: ${contactMethod.type}`
            };
    }
}

/**
 * Send push notification (routes to APN or FCM based on platform)
 */
async function notifyPush(
    contactMethod: ContactMethod,
    options: NotificationOptions
): Promise<NotificationResult> {
    const { platform } = contactMethod;
    // Normalize token at use-time (do not mutate stored value)
    const token = String(contactMethod.token || '')
        .trim()
        .replace(/[<>\s]/g, '');

    if (!token) {
        return {
            success: false,
            provider: 'apn',
            error: 'Invalid device token'
        };
    }

    // Route based on platform
    if (platform === 'ios' || platform === 'apple') {
        // Send via APN
        const payload: APNPayload = options.title && options.body
            ? createAPNAlert(options.title, options.body, options.data)
            : {
                aps: {
                    alert: options.body || options.title || 'New notification',
                    badge: options.badge,
                    sound: options.sound === true ? 'default' : options.sound === false ? undefined : options.sound
                },
                ...options.data
            };

        const result = await notifyAPN(token, payload, {
            priority: options.priority === 'high' ? 10 : 5,
            expiration: options.ttl ? Math.floor(Date.now() / 1000) + options.ttl : undefined,
        });

        return {
            success: result.success,
            provider: 'apn',
            error: result.error,
            details: { apnsId: result.apnsId }
        };
    } else if (platform === 'android' || platform === 'fcm') {
        // TODO: Implement FCM notification
        return {
            success: false,
            provider: 'fcm',
            error: 'FCM notifications not yet implemented'
        };
    } else {
        return {
            success: false,
            provider: 'push',
            error: `Unsupported push platform: ${platform}`
        };
    }
}

/**
 * Send email notification
 */
async function notifyEmail(
    contactMethod: ContactMethod,
    options: NotificationOptions
): Promise<NotificationResult> {
    // TODO: Implement email notification using a service like SendGrid, Mailgun, or AWS SES
    return {
        success: false,
        provider: 'email',
        error: 'Email notifications not yet implemented'
    };
}

/**
 * Send phone/SMS/WhatsApp notification
 */
async function notifyPhone(
    contactMethod: ContactMethod,
    options: NotificationOptions
): Promise<NotificationResult> {
    // TODO: Implement phone notifications using Twilio or similar
    return {
        success: false,
        provider: contactMethod.type,
        error: `${contactMethod.type} notifications not yet implemented`
    };
}

/**
 * Send webhook notification
 */
async function notifyWebhook(
    contactMethod: ContactMethod,
    options: NotificationOptions
): Promise<NotificationResult> {
    try {
        const response = await fetch(contactMethod.identifier, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${contactMethod.token}`
            },
            body: JSON.stringify({
                title: options.title,
                body: options.body,
                data: options.data,
                timestamp: new Date().toISOString()
            })
        });

        return {
            success: response.ok,
            provider: 'webhook',
            error: response.ok ? undefined : `Webhook returned status ${response.status}`,
            details: { status: response.status }
        };
    } catch (error) {
        return {
            success: false,
            provider: 'webhook',
            error: error instanceof Error ? error.message : 'Failed to send webhook notification'
        };
    }
}

/**
 * Send Slack notification
 */
async function notifySlack(
    contactMethod: ContactMethod,
    options: NotificationOptions
): Promise<NotificationResult> {
    // TODO: Implement Slack notification using Slack Web API
    return {
        success: false,
        provider: 'slack',
        error: 'Slack notifications not yet implemented'
    };
}

/**
 * Send Discord notification
 */
async function notifyDiscord(
    contactMethod: ContactMethod,
    options: NotificationOptions
): Promise<NotificationResult> {
    // TODO: Implement Discord notification using Discord webhooks
    return {
        success: false,
        provider: 'discord',
        error: 'Discord notifications not yet implemented'
    };
}

/**
 * Send Telegram notification
 */
async function notifyTelegram(
    contactMethod: ContactMethod,
    options: NotificationOptions
): Promise<NotificationResult> {
    // TODO: Implement Telegram notification using Telegram Bot API
    return {
        success: false,
        provider: 'telegram',
        error: 'Telegram notifications not yet implemented'
    };
}

/**
 * Send notification to all contact methods for a user
 */
export async function notifyUser(
    userId: string,
    options: NotificationOptions,
    types?: ContactMethodType[]
): Promise<NotificationResult[]> {
    // Get all contact methods for the user
    let query = ContactMethod.query().where('user_id', userId);

    // Filter by types if provided
    if (types && types.length > 0) {
        query = query.whereIn('type', types);
    }

    const contactMethods = await query.get();

    // Send notifications to all contact methods
    const results = await Promise.all(
        contactMethods.map(method => notify(method.id, options))
    );

    return results;
}

/**
 * Send notification by identifier (e.g., email address, phone number)
 */
export async function notifyByIdentifier(
    identifier: string,
    options: NotificationOptions
): Promise<NotificationResult> {
    // Find contact method by identifier
    const contactMethod = await ContactMethod.query()
        .where('identifier', identifier)
        .first();

    if (!contactMethod) {
        return {
            success: false,
            provider: 'unknown',
            error: `No contact method found for identifier: ${identifier}`
        };
    }

    return notify(contactMethod.id, options);
}
