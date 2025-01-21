import Post from '~/models/Post';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    
    if (!body.user_id || !body.title || !body.content) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: user_id, title, content'
        });
    }

    const post = await Post.query().create({
        user_id: body.user_id,
        title: body.title,
        content: body.content
    });

    return post;
}); 