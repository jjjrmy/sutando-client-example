import User from "~/models/User";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const userId = Number(event.context.params?.id);

    if (!userId || isNaN(userId)) {
        throw createError({
            statusCode: 400,
            message: 'Valid user ID is required'
        });
    }

    await User.query()
        .where('id', userId)
        .update({
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email
        });
        
    return await User.query().where('id', userId).first();
}); 