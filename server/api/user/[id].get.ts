import User from "~/models/User";

export default defineEventHandler(async (event) => {
    const userId = Number(event.context.params?.id);

    if (!userId || isNaN(userId)) {
        throw createError({
            statusCode: 400,
            message: 'Valid user ID is required'
        });
    }

    const user = await User.query().where('id', userId).with('posts').first();
    
    if (!user) {
        throw createError({
            statusCode: 404,
            message: 'User not found'
        });
    }

    return user;
}); 