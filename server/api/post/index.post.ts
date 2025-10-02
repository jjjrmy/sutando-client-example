import Post from '~/models/Post';
import { z } from 'zod';

const fileRegex = /^data:image\/(png|jpe?g|gif|webp);base64,.+$/;

const CreatePostSchema = z.object({
    title: z.string().nullable().optional(),
    content: z.string(),
    photo: z.string().nullable().optional().refine((val) => val === null || val?.match(fileRegex), {
        message: 'Invalid image format. Only PNG, JPEG, GIF, and WebP allowed.'
    }),
});

function getFileExtension(imageFormat: string) {
    return {
        'png': 'png',
        'gif': 'gif',
        'webp': 'webp',
        'jpeg': 'jpg',
        'jpg': 'jpg'
    }[imageFormat];
}

export default defineEventHandler(async (event) => {
    const R2 = event.context.cloudflare.env.R2 as R2Bucket;

    const user = await requireAuth();
    const body = await readBody(event);

    const validatedData = CreatePostSchema.parse(body);

    const post = await Post.query().create({
        user_id: user.id,
        title: validatedData.title || null,
        content: validatedData.content,
        photo: null
    });

    try {
        const [base64Data, imageFormat] = body.photo.match(fileRegex);
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const arrayBuffer = imageBuffer.buffer.slice(
            imageBuffer.byteOffset,
            imageBuffer.byteOffset + imageBuffer.byteLength
        );

        const objectKey = `${user.id}/${post.id}.${getFileExtension(imageFormat)}`;

        await R2.put(objectKey, arrayBuffer, {
            httpMetadata: {
                contentType: `image/${getFileExtension(imageFormat)}`,
                cacheControl: 'public, max-age=31536000',
            },
            customMetadata: {
                userId: user.id,
                postId: post.id.toString(),
                uploadedAt: new Date().toISOString()
            }
        });

        await post.update({ photo: objectKey });

    } catch (error) {
        await post.delete();

        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Failed to upload image'
        });
    }

    return post;
});