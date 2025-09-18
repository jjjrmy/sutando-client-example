import { betterAuth } from 'better-auth';
import { sutandoAdapter } from "../../db/adapter/sutando";
import { phoneNumber } from "better-auth/plugins";
import User from "../../models/User";

let _auth: ReturnType<typeof betterAuth>
export function serverAuth() {
    if (!_auth) {
        _auth = betterAuth({
            database: sutandoAdapter({
                useTransactions: false,
                debugLogs: process.env.NODE_ENV === 'development',
            }),
            baseURL: getBaseURL(),
            user: {
                modelName: "users",
            },
            account: {
                accountLinking: {
                    enabled: true,
                },
            },
            emailAndPassword: {
                enabled: true,
            },
            socialProviders: {
                apple: {
                    clientId: process.env.APPLE_CLIENT_ID as string,
                    clientSecret: process.env.APPLE_CLIENT_SECRET as string,
                    // Optional
                    // appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
                },
                github: {
                    clientId: process.env.GITHUB_CLIENT_ID as string,
                    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
                },
                google: {
                    clientId: process.env.GOOGLE_CLIENT_ID as string,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                },
            },
            plugins: [
                phoneNumber({
                    schema: {
                        user: {
                            modelName: "users",
                        },
                    },
                    sendOTP: async ({ phoneNumber, code }) => {
                        console.log("Sending OTP to", phoneNumber, "with code", code);
                        await fetch(
                            `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_ID}/Verifications`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Authorization': 'Basic ' + btoa(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`)
                                },
                                body: new URLSearchParams({
                                    To: phoneNumber,
                                    Channel: 'sms',
                                    CustomCode: code
                                })
                            }
                        );
                    },
                    callbackOnVerification: async ({ phoneNumber, user }, request) => {
                        console.log('Callback on verification for user:', user?.id);
                        try {
                            if (!user || user.name !== phoneNumber) return;

                            const response = await fetch(
                                `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phoneNumber)}?Fields=caller_name`,
                                {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': 'Basic ' + btoa(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`)
                                    }
                                }
                            );

                            if (!response.ok) return;

                            const data = await response.json() as {
                                caller_name?: {
                                    caller_name?: string;
                                    caller_type?: string;
                                    error_code?: string | null;
                                } | null;
                                national_format?: string;
                            };

                            const name = data.caller_name?.caller_name ? data.caller_name.caller_name : data.national_format;

                            await User.query().where('id', user.id).update({ name });
                        } catch (error) {
                            console.error('Error fetching caller name:', error);
                        }
                    },
                    signUpOnVerification: {
                        getTempEmail: (phoneNumber) => `${phoneNumber}@my-site.com`,
                        getTempName: (phoneNumber) => phoneNumber
                    }
                })
            ],
        })
    }
    return _auth
}

function getBaseURL() {
    let baseURL = process.env.BETTER_AUTH_URL
    if (!baseURL) {
        try {
            baseURL = getRequestURL(useEvent()).origin
        }
        catch (e) { }
    }
    return baseURL
}