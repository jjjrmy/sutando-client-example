import { notify, notifyUser } from '~/server/utils/notify';
import ContactMethod from '~/models/ContactMethod';

export default defineEventHandler(async (event) => {
    // Require authentication
    const user = await requireAuth();

    // Read request body
    const body = await readBody(event);

    // Validate required fields
    if (!body.title && !body.body) {
        throw createError({
            statusCode: 400,
            message: 'At least one of title or body is required'
        });
    }

    // Option 1: Send to a specific contact method
    if (body.contactMethodId) {
        // Verify the contact method belongs to the authenticated user
        const contactMethod = await ContactMethod.query()
            .where('id', body.contactMethodId)
            .where('user_id', user.id)
            .first();

        if (!contactMethod) {
            throw createError({
                statusCode: 404,
                message: 'Contact method not found or does not belong to user'
            });
        }

        const result = await notify(body.contactMethodId, {
            title: body.title,
            body: body.body,
            data: body.data,
            badge: body.badge,
            sound: body.sound,
            priority: body.priority,
            ttl: body.ttl
        });

        return result;
    }

    // Option 2: Send to all user's contact methods (or filtered by type)
    if (body.broadcast) {
        const results = await notifyUser(
            user.id,
            {
                title: body.title,
                body: body.body,
                data: body.data,
                badge: body.badge,
                sound: body.sound,
                priority: body.priority,
                ttl: body.ttl
            },
            body.types // Optional array of ContactMethodType values to filter
        );

        return {
            broadcast: true,
            results
        };
    }

    throw createError({
        statusCode: 400,
        message: 'Either contactMethodId or broadcast:true must be provided'
    });
});
