import User from "~/models/User";

export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);

    try {
        return await User.query()
            .where('id', id)
            .with('posts')
            .firstOrFail();
    } catch (error) {
        throw createError({
            statusCode: 404
        });
    }
});