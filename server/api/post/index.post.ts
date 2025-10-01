import Post from '~/models/Post';

export default defineEventHandler(async (event) => {
    const user = await requireAuth();
    const body = await readBody(event);

    if (!body.content) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: content'
        });
    }

    // Create the post first to get the ID
    const post = await Post.query().create({
        user_id: user.id,
        title: body.title || null,
        content: body.content,
        photo: null // Will update this after uploading to R2 if image is provided
    });

    // Handle image upload if provided
    if (body.photo) {
        try {
            // Validate that the photo is a base64 image
            const imageDataMatch = body.photo.match(/^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/);
            if (!imageDataMatch) {
                throw createError({
                    statusCode: 400,
                    message: 'Invalid image format. Only PNG, JPEG, GIF, and WebP images are allowed.'
                });
            }

            const imageFormat = imageDataMatch[1];
            const base64Data = imageDataMatch[2];
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const arrayBuffer = imageBuffer.buffer.slice(
                imageBuffer.byteOffset,
                imageBuffer.byteOffset + imageBuffer.byteLength
            );

            // Validate file size (10MB limit)
            if (imageBuffer.length > 10 * 1024 * 1024) {
                throw createError({
                    statusCode: 400,
                    message: 'Image size exceeds 10MB limit'
                });
            }

            // Get the R2 binding from the event context
            const r2 = event.context.cloudflare?.env?.R2;
            if (!r2) {
                await post.delete();
                throw createError({
                    statusCode: 503,
                    statusMessage: 'Image storage service unavailable',
                    data: {
                        detail: 'R2 storage is not configured. For local development, run: npx wrangler pages dev --local'
                    }
                });
            }

            // Construct the R2 object key and upload
            const fileExtension = imageFormat === 'jpeg' ? 'jpg' : imageFormat;
            const objectKey = `${user.id}/${post.id}.${fileExtension}`;

            await r2.put(objectKey, arrayBuffer, {
                httpMetadata: {
                    contentType: `image/${imageFormat === 'jpeg' ? 'jpeg' : imageFormat}`,
                    cacheControl: 'public, max-age=31536000', // Cache for 1 year
                },
                customMetadata: {
                    userId: user.id,
                    postId: post.id.toString(),
                    uploadedAt: new Date().toISOString()
                }
            });

            // Save only the relative path in the database
            await post.update({ photo: objectKey });

        } catch (error) {
            // If image upload fails, delete the post to maintain consistency
            await post.delete();

            // Re-throw the error if it's already a proper error
            if (error && typeof error === 'object' && 'statusCode' in error) {
                throw error;
            }

            // Otherwise, throw a generic error with better error detail
            let errorMessage = 'Failed to upload image: ';
            if (error instanceof Error) {
                errorMessage += error.message;
            } else {
                errorMessage += typeof error === 'string' ? error : JSON.stringify(error);
            }

            throw createError({
                statusCode: 500,
                message: errorMessage
            });
        }
    }

    return post;
});