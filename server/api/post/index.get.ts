import { Builder } from 'sutando';
import Post from '~/models/Post';

export default defineEventHandler(async (event) => {
    await requireAuth();

    const { user_id } = getQuery(event);

    let posts: Builder<Post> = Post.query().with('user');

    if (user_id) {
        posts = posts.where('user_id', user_id as string);
    }

    return await posts
        .orderBy('created_at', 'desc')
        .get();
});
