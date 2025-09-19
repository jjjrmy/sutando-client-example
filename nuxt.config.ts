import path from 'node:path';
import tailwindcss from "@tailwindcss/vite";

const isSSR = import.meta.env.NUXT_SSR != 'false';
const isSSL = import.meta.env.NUXT_SSL == 'true';

export default defineNuxtConfig({
    compatibilityDate: '2025-09-11',
    devtools: { enabled: false },
    ssr: isSSR,
    css: ['~/assets/css/main.css'],
    modules: ["nitro-cloudflare-dev", 'nuxt-security'],
    runtimeConfig: {
        public: {
            apiBaseUrl: isSSR ? undefined : process.env.API_BASE_URL,
            isMobile: import.meta.env.NUXT_MOBILE == 'true',
            auth: {
                redirectUserTo: '/dashboard',
                redirectGuestTo: '/',
            },
        }
    },
    vite: {
        plugins: [
            tailwindcss(),
        ],
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
        }
    },
    security: {
        corsHandler: {
            origin: ['http://localhost:3000', 'https://localhost:3000', 'https://192.168.0.122:3000', 'http://localhost:3001', 'capacitor://localhost'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        },
    },
    ...(isSSL ? {
        devServer: {
            https: {
                key: path.resolve(__dirname, 'localhost-key.pem'),
                cert: path.resolve(__dirname, 'localhost.pem'),
            }
        },
    } : {}),
})