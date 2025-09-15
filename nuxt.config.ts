export default defineNuxtConfig({
    compatibilityDate: '2025-09-11',
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
    },
    vite: {
        build: {
            rollupOptions: {
                external: ['better-sqlite3', 'tedious', 'mysql', 'mysql2', 'oracledb', 'pg', 'sqlite3', 'pg-query-stream']
            }
        },
        resolve: {
            alias: {
                'sqlite3': 'data:text/javascript,export default {}',
                'better-sqlite3': 'data:text/javascript,export default {}',
                'pg': 'data:text/javascript,export default {}',
                'pg-query-stream': 'data:text/javascript,export default {}',
                'mysql': 'data:text/javascript,export default {}',
                'mysql2': 'data:text/javascript,export default {}',
                'oracledb': 'data:text/javascript,export default {}',
                'tedious': 'data:text/javascript,export default {}'
            }
        }
    },
    nitro: {
        externals: {
            external: ['__STATIC_CONTENT_MANIFEST', 'better-sqlite3', 'tedious', 'mysql', 'mysql2', 'oracledb', 'pg', 'sqlite3', 'pg-query-stream'],
        },
        rollupConfig: {
            external: ['__STATIC_CONTENT_MANIFEST', 'better-sqlite3', 'tedious', 'mysql', 'mysql2', 'oracledb', 'pg', 'sqlite3', 'pg-query-stream'],
            plugins: [
                {
                    name: 'mock-database-drivers',
                    resolveId(id) {
                        const driverIds = ['sqlite3', 'better-sqlite3', 'pg', 'pg-query-stream', 'mysql', 'mysql2', 'oracledb', 'tedious'];
                        if (driverIds.includes(id)) {
                            return { id: 'virtual:' + id, external: false };
                        }
                    },
                    load(id) {
                        if (id.startsWith('virtual:')) {
                            return 'export default {};';
                        }
                    }
                }
            ]
        },
        prerender: {
            autoSubfolderIndex: false
        }
    }
})