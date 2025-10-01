import Post from '~/models/Post';

export default defineEventHandler(async (event) => {
    try {
        await requireAuth();

        const query = getQuery(event);
        let postQuery = Post.query();

        // Filter by user_id if provided
        if (query.user_id) {
            postQuery = postQuery.where('user_id', query.user_id as string);
        }

        // Always include author relationship
        postQuery = postQuery.with('user');

        return await postQuery.orderBy('created_at', 'desc').limit(100).get();
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch posts',
        });
    }
});
