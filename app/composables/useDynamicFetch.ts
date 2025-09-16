import type { UseFetchOptions } from 'nuxt/app'

export const useDynamicFetch = <T>(request: Parameters<typeof useFetch<T>>[0], opts: UseFetchOptions<T> = {}) => {
    const config = useRuntimeConfig();
    const isServer = import.meta.server;

    // If we're on the server, we typically want absolute URLs or let Nitro handle /api
    // If we're on the client, apply public base URL when provided
    const baseURL = config.public.apiBaseUrl;

    // Only set baseURL when one isn't explicitly provided
    const serverForwardHeaders = isServer
        ? (useRequestHeaders(["cookie", "authorization", "user-agent", "x-forwarded-for"]) as Record<string, string>)
        : ({} as Record<string, string>)

    const mergedOptions = {
        ...(opts as any),
        baseURL: baseURL,
        headers: {
            ...serverForwardHeaders,
            ...((opts as any).headers || {}),
        },
        credentials: (opts as any).credentials ?? 'include',
    } as any;

    return useFetch<T>(request as any, mergedOptions);
}