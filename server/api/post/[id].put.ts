import { z } from 'zod';
import Post from '~/models/Post';

const UpdatePostSchema = z.object({
    title: z.string().nullable().optional(),
    content: z.string(),
    photo: z.string().nullable().optional(),
});

export default defineEventHandler(async (event) => {
    const user = await requireAuth();

    const { id } = getRouterParams(event);
    const body = await readBody(event);

    const validatedData = UpdatePostSchema.parse(body);

    const post = await Post.query()
        .where('id', id)
        .where('user_id', user.id)
        .firstOrFail();

    try {
        await post.update({
            title: validatedData.title ?? null,
            content: validatedData.content,
            ...(validatedData.photo !== undefined ? { photo: validatedData.photo } : {}),
        });

        return post;
    } catch (error) {
        throw createError({
            statusCode: 400
        });
    }
}); 