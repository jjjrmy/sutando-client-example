import type { UseFetchOptions } from 'nuxt/app'

export const useDynamicFetch = <T>(request: Parameters<typeof useFetch<T>>[0], opts: UseFetchOptions<T> = {}) => {
    const config = useRuntimeConfig();

    // Only set baseURL when one isn't explicitly provided
    const mergedOptions = {
        ...(opts as any),
        baseURL: (opts as any).baseURL ?? config.public.apiBaseUrl,
        credentials: 'include',
    } as any;

    return useFetch<T>(request as any, mergedOptions);
}