export default defineNitroPlugin((nitroApp) => {
    // Log unhandled errors with full context
    nitroApp.hooks.hook('error', (error, { event }) => {
        try {
            // Enhanced error logging with more context
            console.error('[nitro:error]', {
                url: event?.path,
                method: event?.method,
                message: (error as any)?.message,
                stack: (error as any)?.stack,
                // Additional information to help identify the exact file
                error: error,
                // Try to get the original source if available
                source: (error as any)?.source || (error as any)?.fileName || (error as any)?.file,
                // Get line and column information if available
                line: (error as any)?.line || (error as any)?.lineNumber,
                column: (error as any)?.column || (error as any)?.columnNumber,
                // Get the original unminified code if available
                originalStack: (error as any)?.originalStack || (error as any)?.sourcesContent,
            });
        } catch (logError) {
            console.error('Error while logging error:', logError);
        }
    });
});
