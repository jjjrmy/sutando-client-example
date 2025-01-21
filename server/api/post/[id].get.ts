import Post from '~/models/Post';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Post ID is required'
        });
    }
    
    const post = await Post.query()
        .where('id', id)
        .with('author')
        .first();

    if (!post) {
        throw createError({
            statusCode: 404,
            message: 'Post not found'
        });
    }

    return post;
}); 