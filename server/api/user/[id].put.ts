import User from "../../../models/User";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const userId = String(event.context.params?.id);

    if (!userId) {
        throw createError({
            statusCode: 400,
            message: 'Valid user ID is required'
        });
    }

    await User.query()
        .where('id', userId)
        .update({
            name: body.name,
            email: body.email
        });

    return await User.query().where('id', userId).first();
}); 