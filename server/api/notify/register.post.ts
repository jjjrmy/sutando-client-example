import ContactMethod from '../../../models/ContactMethod';
import { ContactMethodType } from '../../../models/ContactMethodType';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    // Require authentication and get the user
    try {
        const user = await requireAuth();
        console.log('user', { user });

        // Read request body
        const body = await readBody(event);

        // Validate required fields
        if (!body.type || !body.token || !body.identifier || !body.platform) {
            throw createError({
                statusCode: 400,
                message: 'Missing required fields: type, token, identifier, platform'
            });
        }

        // Validate that the type is a valid ContactMethodType
        if (!Object.values(ContactMethodType).includes(body.type)) {
            throw createError({
                statusCode: 400,
                message: `Invalid contact method type. Must be one of: ${Object.values(ContactMethodType).join(', ')}`
            });
        }


        console.log('body', body);

        try {
            // Store raw token as provided; normalization happens at send time
            const rawToken = String(body.token);
            // Upsert the contact method based on identifier for the authenticated user
            // First check if the contact method exists
            const existingContactMethod = await ContactMethod.query()
                .where('user_id', user.id)
                .where('identifier', body.identifier)
                .first();

            let contactMethod;
            if (existingContactMethod) {
                // Update existing record
                await ContactMethod.query()
                    .where('id', existingContactMethod.id)
                    .update({
                        type: body.type,
                        token: rawToken,
                        platform: body.platform,
                        expires_at: body.expires_at || null,
                        updated_at: new Date().toISOString() // Convert Date to ISO string for D1 compatibility
                    });

                contactMethod = await ContactMethod.query()
                    .where('id', existingContactMethod.id)
                    .first();
            } else {
                // Create new record
                contactMethod = await ContactMethod.query().create({
                    user_id: user.id,
                    type: body.type,
                    token: rawToken,
                    identifier: body.identifier,
                    platform: body.platform,
                    expires_at: body.expires_at || null
                });
            }
            console.log('contactMethod', contactMethod);
        } catch (error) {
            console.log('error', error);
        }
    } catch (error) {
        console.log('error', error);
    }

    return { success: true };
});
