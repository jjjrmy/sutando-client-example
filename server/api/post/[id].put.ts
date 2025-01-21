import Post from '~/models/Post';

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Post ID is required'
        });
    }

    const body = await readBody(event);
    
    if (!body.title || !body.content) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: title, content'
        });
    }

    const post = await Post.query()
        .where('id', id)
        .first();

    if (!post) {
        throw createError({
            statusCode: 404,
            message: 'Post not found'
        });
    }

    await post.update({
        title: body.title,
        content: body.content,
        updated_at: new Date()
    });

    return post;
}); 