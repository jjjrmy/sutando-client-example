import Post from '~/models/Post';

export default defineEventHandler(async (event) => {
    const user = await requireAuth();

    const { id } = getRouterParams(event);

    try {
        const post = await Post.query()
            .where('id', id)
            .where('user_id', user.id)
            .firstOrFail();

        await post.delete();

        return;
    } catch (error) {
        throw createError({
            statusCode: 404
        });
    }
}); 