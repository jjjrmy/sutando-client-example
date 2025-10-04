import path from 'node:path';
import tailwindcss from "@tailwindcss/vite";

const isSSR = import.meta.env.NUXT_SSR != 'false';
const isSSL = import.meta.env.NUXT_SSL == 'true';

import appConfig from "./capacitor.config";

export default defineNuxtConfig({
    compatibilityDate: '2025-09-11',
    devtools: { enabled: false },
    ssr: isSSR,
    css: ['@/assets/css/main.css'],
    alias: {
        '~': path.resolve(__dirname, '.'),
    },
    modules: ["nitro-cloudflare-dev", 'nuxt-security', '@nuxt/icon'],
    app: {
        head: {
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
            ]
        }
    },
    runtimeConfig: {
        public: {
            appUrl: process.env.APP_URL,
            appIdentifier: appConfig.appId,
            apiBaseUrl: isSSR ? undefined : process.env.APP_URL,
            isMobile: import.meta.env.NUXT_MOBILE == 'true',
            auth: {
                redirectUserTo: '/',
                redirectGuestTo: '/auth',
            },
            paywall: {
                redirectTo: '/paywall',
                allowTrial: true,
            },
            cdnUrl: process.env.CDN_URL || '',
        }
    },
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
    nitro: {
        experimental: {
            asyncContext: true,
        },
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
    icon: {
        serverBundle: {
            collections: ['ri']
        }
    },
    security: {
        headers: {
            contentSecurityPolicy: {
                'img-src': ["'self'", 'data:', 'https://www.gravatar.com', process.env.CDN_URL || ''],
            },
            permissionsPolicy: {
                'camera': ['self'],
                'microphone': ['self'],
                'geolocation': [],
            }
        },
        corsHandler: {
            origin: ['http://127.0.0.1:3000', 'https://127.0.0.1:3000', 'http://localhost:3000', 'https://localhost:3000', 'https://192.168.0.122:3000', 'http://localhost:3001', 'capacitor://localhost'],
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