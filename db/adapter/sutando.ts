/**
 * Sutando Adapter for Better Auth
 * 
 * This adapter provides a bridge between Better Auth and Sutando ORM,
 * with special optimizations for Cloudflare D1 compatibility.
 * 
 * Features:
 * - Automatic Date to ISO string conversion
 * - Optional transaction support
 * - Complex query support
 * - Extensible value transformers
 */

import { createAdapterFactory, type AdapterDebugLogs } from "better-auth/adapters";
import { sutando } from "sutando";
import { randomUUID } from "node:crypto";

/**
 * Sutando adapter configuration options
 */
interface SutandoAdapterConfig {
    /**
     * The connection name to use (defaults to 'default')
     */
    connectionName?: string;
    /**
     * Whether to enable transactions (should be false for D1)
     */
    useTransactions?: boolean;
    /**
     * Helps you debug issues with the adapter
     */
    debugLogs?: AdapterDebugLogs;
    /**
     * If the table names in the schema are plural
     */
    usePlural?: boolean;
}

/**
 * SQL operators mapping Better Auth operators to SQL symbols
 */
export const SQLOperator = {
    eq: '=',
    ne: '!=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    in: 'in',
    notIn: 'notIn',
    contains: 'contains',
    startsWith: 'startsWith',
    endsWith: 'endsWith',
    null: 'null',
    notNull: 'notNull'
} as const;

type SQLOperatorKey = keyof typeof SQLOperator;

/**
 * SQL connectors used by Better Auth
 */
enum SQLConnector {
    AND = 'AND',
    OR = 'OR'
}

/**
 * Knex where methods
 */
enum WhereMethod {
    WHERE = 'where',
    OR_WHERE = 'orWhere',
    WHERE_NULL = 'whereNull',
    OR_WHERE_NULL = 'orWhereNull',
    WHERE_NOT_NULL = 'whereNotNull',
    OR_WHERE_NOT_NULL = 'orWhereNotNull',
    WHERE_IN = 'whereIn',
    OR_WHERE_IN = 'orWhereIn',
    WHERE_NOT_IN = 'whereNotIn',
    OR_WHERE_NOT_IN = 'orWhereNotIn'
}

/**
 * Value transformers that can be applied to data
 */
type ValueTransformer = {
    name: string;
    transform: (value: any) => any;
};

/**
 * Built-in transformers - exported for extensibility
 */
export const transformers = {
    date: {
        name: 'date',
        transform: (value: any) => value instanceof Date ? value.toISOString() : value
    },
};

// Default transformers for D1 compatibility
const DEFAULT_TRANSFORMERS = [transformers.date];

/**
 * Creates a Better Auth adapter for Sutando ORM
 * 
 * @param config - The adapter configuration
 * @returns A Better Auth adapter instance
 */
export const sutandoAdapter = (config: SutandoAdapterConfig = {}) =>
    createAdapterFactory({
        config: {
            adapterId: "sutando-adapter",
            adapterName: "Sutando Adapter",
            usePlural: config.usePlural ?? false,
            debugLogs: config.debugLogs ?? false,
            supportsJSON: true,
            supportsDates: false, // D1 doesn't support Date objects, we convert them to ISO strings
            supportsBooleans: true,
            supportsNumericIds: true,
            transaction: config.useTransactions !== false
                ? async (fn) => {
                    const connection = sutando.connection(config.connectionName || 'default');
                    return await connection.transaction(async () => {
                        const debugLog = createDebugLog(config.debugLogs);
                        const methods = createMethods(connection, debugLog);
                        return await fn({
                            id: randomUUID(),
                            ...methods
                        });
                    });
                }
                : false,
        },
        adapter: ({ debugLog }) => {
            const connection = sutando.connection(config.connectionName || 'default');
            return {
                ...createMethods(connection, debugLog),
                options: config,
            };
        },
    });

/**
 * Creates a debug log function
 */
function createDebugLog(debugLogs: AdapterDebugLogs | undefined) {
    return (method: string, data: any) => {
        if (debugLogs) {
            console.log(`[Sutando Adapter] ${method}:`, data);
        }
    };
}

/**
 * Creates the adapter methods for a given connection
 */
function createMethods(connection: any, debugLog: (method: string, data: any) => void) {
    const buildQuery = (model: string, where?: any, select?: string[]) => {
        const query = connection.table(model);
        if (select?.length) query.select(...select);
        applyWhere(query, where);
        return query;
    };

    return {
        create: async ({ model, data }: any) => {
            debugLog("create", { model, data });
            const id = data.id || randomUUID();
            await connection.table(model).insert(transformValues({ ...data, id }, DEFAULT_TRANSFORMERS));
            return await connection.table(model).where('id', id).first();
        },

        update: async ({ model, where, update, select }: any) => {
            debugLog("update", { model, where, update, select });
            await buildQuery(model, where).update(transformValues(update, DEFAULT_TRANSFORMERS));
            return await buildQuery(model, where, select).first();
        },

        updateMany: async ({ model, where, update }: any) => {
            debugLog("updateMany", { model, where, update });
            return await buildQuery(model, where).update(transformValues(update, DEFAULT_TRANSFORMERS));
        },

        delete: async ({ model, where }: any) => {
            debugLog("delete", { model, where });
            await buildQuery(model, where).delete();
        },

        deleteMany: async ({ model, where }: any) => {
            debugLog("deleteMany", { model, where });
            return await buildQuery(model, where).delete();
        },

        findOne: async ({ model, where, select }: any) => {
            debugLog("findOne", { model, where, select });
            return (await buildQuery(model, where, select).first()) || null;
        },

        findMany: async ({ model, where, limit, offset, sortBy, select }: any) => {
            debugLog("findMany", { model, where, limit, offset, sortBy, select });
            const query = buildQuery(model, where, select);
            if (limit !== undefined) query.limit(limit);
            if (offset !== undefined) query.offset(offset);
            if (sortBy?.field) query.orderBy(sortBy.field, sortBy.direction);
            return await query.get();
        },

        count: async ({ model, where }: any) => {
            debugLog("count", { model, where });
            const [{ count }] = await buildQuery(model, where).count('* as count');
            return Number(count);
        },
    };
}

/**
 * Maps operators to their base where method names
 */
const OPERATOR_METHOD_MAP: Record<string, WhereMethod> = {
    null: WhereMethod.WHERE_NULL,
    notNull: WhereMethod.WHERE_NOT_NULL,
    in: WhereMethod.WHERE_IN,
    notIn: WhereMethod.WHERE_NOT_IN,
};

/**
 * Gets the appropriate query method based on operator and connector
 */
function getWhereMethod(operator: SQLOperatorKey, isOr: boolean): string {
    const baseMethod = OPERATOR_METHOD_MAP[operator];
    if (!baseMethod) {
        return isOr ? WhereMethod.OR_WHERE : WhereMethod.WHERE;
    }
    // Convert WHERE_XXX to OR_WHERE_XXX if needed
    return isOr ? baseMethod.replace('where', 'orWhere') : baseMethod;
}

/**
 * Maps LIKE operators to their patterns
 */
const LIKE_PATTERNS: Record<string, (value: string) => string> = {
    contains: (value) => `%${value}%`,
    startsWith: (value) => `${value}%`,
    endsWith: (value) => `%${value}`,
};

/**
 * Applies where conditions to a query
 */
function applyWhere(query: any, where: any) {
    if (!where || !Array.isArray(where)) return;

    where.forEach((condition: any) => {
        const { field, value, operator, connector } = condition;
        const isOr = connector === SQLConnector.OR;
        const whereMethod = isOr ? WhereMethod.OR_WHERE : WhereMethod.WHERE;

        switch (operator as SQLOperatorKey) {
            // Null operators - no value needed
            case 'null':
            case 'notNull':
                query[getWhereMethod(operator, isOr)](field);
                break;

            // Array operators - need array value processing
            case 'in':
            case 'notIn':
                const arrayValue = Array.isArray(value) ? value.map(transformers.date.transform) : value;
                query[getWhereMethod(operator, isOr)](field, arrayValue);
                break;

            // LIKE operators - use pattern functions
            case 'contains':
            case 'startsWith':
            case 'endsWith':
                const pattern = LIKE_PATTERNS[operator];
                if (pattern) {
                    query[whereMethod](field, 'like', pattern(value));
                }
                break;

            // Comparison operators - use SQL symbol mapping
            case 'eq':
            case 'ne':
            case 'gt':
            case 'gte':
            case 'lt':
            case 'lte':
                const processedValue = transformers.date.transform(value);
                const sqlSymbol = SQLOperator[operator as keyof typeof SQLOperator];
                query[whereMethod](field, sqlSymbol, processedValue);
                break;

            // Unknown operators default to equality
            default:
                query[whereMethod](field, transformers.date.transform(value));
        }
    });
}

/**
 * Transforms values in an object using provided transformers
 */
function transformValues(obj: any, valueTransformers: ValueTransformer[]): any {
    if (!obj || typeof obj !== 'object') return obj;

    const processed: any = {};
    for (const [key, value] of Object.entries(obj)) {
        let transformedValue = value;
        for (const transformer of valueTransformers) {
            transformedValue = Array.isArray(transformedValue)
                ? transformedValue.map(transformer.transform)
                : transformer.transform(transformedValue);
        }
        processed[key] = transformedValue;
    }
    return processed;
}