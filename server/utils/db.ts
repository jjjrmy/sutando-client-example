import type { D1Database, D1ExecResult, D1PreparedStatement } from '@cloudflare/workers-types'

let _db: D1Database

/**
 * Access the D1 database.
 *
 * @example ```ts
 * const db = hubDatabase()
 * const result = await db.exec('SELECT * FROM table')
 * ```
 *
 * @see https://hub.nuxt.com/docs/features/database
 */
export function d1Database(): D1Database {
    if (_db) {
        return _db
    }
    // @ts-expect-error globalThis.__env__ is not defined
    const binding = process.env.DB || globalThis.__env__?.DB || globalThis.DB
    if (binding) {
        _db = binding as D1Database
        return _db
    }
    throw createError('Missing Cloudflare DB binding (D1)')
}