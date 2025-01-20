export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: false },
    routeRules: {
        '/api/**': { cors: true }
    },
    app: {
        head: {
            script: [
                {
                    src: 'https://unpkg.com/tailwindcss-jit-cdn',
                }
            ]
        }
    }
})