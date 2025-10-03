export default defineNuxtPlugin(async (nuxtApp) => {
    // Clear the session fetch promise on each navigation
    nuxtApp.hook('page:start', () => {
        // Clear the promise at the start of each page navigation
        const sessionFetchPromise = useState<Promise<any> | null>('auth:sessionFetchPromise', () => null)
        sessionFetchPromise.value = null
    })

    if (!nuxtApp.payload.serverRendered) {
        // Force fetch on initial client-side load
        await useAuth().fetchSession(true)
    }
    else if (Boolean(nuxtApp.payload.prerenderedAt) || Boolean(nuxtApp.payload.isCached)) {
        // To avoid hydration mismatch, force fetch after mount
        nuxtApp.hook('app:mounted', async () => {
            await useAuth().fetchSession(true)
        })
    }
})