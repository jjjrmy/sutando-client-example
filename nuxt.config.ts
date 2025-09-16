const isStatic = import.meta.env.NUXT_SSR === 'false';

export default defineNuxtConfig({
    compatibilityDate: '2025-09-11',
    devtools: { enabled: false },
    ssr: true,
    modules: ["nitro-cloudflare-dev"],
    runtimeConfig: {
        public: {
            apiBaseUrl: isStatic ? process.env.NUXT_PUBLIC_API_BASE : undefined
        }
    },
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
    },
    nitro: {
        externals: {
            traceInclude: ["node_modules/knex/knex.js"],
        },
        virtual: {
            'better-sqlite3': 'export default {}',
            'tedious': 'export default {}',
            'mysql': 'export default {}',
            'mysql2': 'export default {}',
            'oracledb': 'export default {}',
            'pg': 'export default {}',
            'sqlite3': 'export default {}',
            'pg-query-stream': 'export default {}',
            'debug': 'export default function createDebug(){return function debug(){}}'
        },
        prerender: {
            autoSubfolderIndex: false
        }
    }
})