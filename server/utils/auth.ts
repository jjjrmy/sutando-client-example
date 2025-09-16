import { betterAuth } from "better-auth";
import { D1Dialect } from 'kysely-d1';
import { phoneNumber } from "better-auth/plugins";
import User from "../../models/User";

export default function useAuth(db: any) {
    return betterAuth({
        trustedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
        database: {
            dialect: new D1Dialect({
                database: db,
            }),
            type: 'sqlite',
        },
        user: {
            table: "users",
            modelName: "users",
            fields: {
                emailVerified: "email_verified",
                createdAt: "created_at",
                updatedAt: "updated_at",
            },
        },
        session: {
            modelName: "sessions",
            fields: {
                userId: "user_id",
                ipAddress: "ip_address",
                userAgent: "user_agent",
                expiresAt: "expires_at",
                createdAt: "created_at",
                updatedAt: "updated_at",
            },
        },
        account: {
            modelName: "accounts",
            fields: {
                accountId: "account_id",
                providerId: "provider_id",
                userId: "user_id",
                accessToken: "access_token",
                refreshToken: "refresh_token",
                idToken: "id_token",
                accessTokenExpiresAt: "access_token_expires_at",
                refreshTokenExpiresAt: "refresh_token_expires_at",
                createdAt: "created_at",
                updatedAt: "updated_at",
            },
        },
        emailAndPassword: {
            enabled: true,
        },
        plugins: [
            // bearer(),
            phoneNumber({
                schema: {
                    user: {
                        modelName: "users",
                        fields: {
                            phoneNumber: "phone_number",
                            phoneNumberVerified: "phone_number_verified",
                        },
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
    });
}