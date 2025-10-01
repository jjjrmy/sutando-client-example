import Post from '~/models/Post';

export default defineEventHandler(async (event) => {
    const { id } = getRouterParams(event);

    try {
        return await Post.query()
            .where('id', id)
            .with('user')
            .firstOrFail();
    } catch (error) {
        throw createError({
            statusCode: 404,
            message: 'Post not found'
        });
    }
}); 