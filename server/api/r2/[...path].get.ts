// Serve R2 images for local development
export default defineEventHandler(async (event) => {
    const path = getRouterParam(event, 'path');
    if (!path) {
        throw createError({ statusCode: 400, message: 'Invalid path' });
    }

    const r2 = event.context.cloudflare?.env?.R2;
    if (!r2) {
        throw createError({ statusCode: 503, message: 'R2 storage is not available' });
    }

    try {
        const object = await r2.get(path);
        if (!object) {
            throw createError({ statusCode: 404, message: 'Image not found' });
        }

        return new Response(object.body, {
            headers: {
                'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
                'Cache-Control': object.httpMetadata?.cacheControl || 'public, max-age=3600',
                'ETag': object.httpEtag || '',
            }
        });
    } catch (error) {
        if (error && typeof error === 'object' && 'statusCode' in error) throw error;
        throw createError({ statusCode: 500, message: 'Failed to retrieve image' });
    }
});
