import { createAdapterFactory, type AdapterDebugLogs } from "better-auth/adapters";
import { sutando } from "sutando";

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
                        const debugLog = (method: string, data: any) => {
                            if (config.debugLogs) {
                                console.log(`[Sutando Adapter] ${method}:`, data);
                            }
                        };
                        const methods = createMethods(connection, debugLog);
                        return await fn({
                            id: crypto.randomUUID(), // Add transaction ID
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
 * Creates the adapter methods for a given connection
 */
function createMethods(connection: any, debugLog: (method: string, data: any) => void) {
    return {
        create: async ({ model, data, select }: any) => {
            debugLog("create", { model, data, select });

            // Get a new ID if not provided
            const id = data.id || generateId();
            const dataWithId = { ...data, id };

            // Convert Date objects to ISO strings for D1 compatibility
            const processedData = processDateValues(dataWithId);

            // Insert the record
            await connection.table(model).insert(processedData);

            // Return the created record
            const created = await connection
                .table(model)
                .where('id', id)
                .first();

            return created;
        },

        update: async ({ model, where, update }: any) => {
            debugLog("update", { model, where, update });

            // Convert Date objects to ISO strings for D1 compatibility
            const processedUpdate = processDateValues(update);

            // Build the where clause
            const query = connection.table(model);
            applyWhere(query, where);

            // Update the record
            await query.update(processedUpdate);

            // Return the updated record
            const query2 = connection.table(model);
            applyWhere(query2, where);
            const updated = await query2.first();

            return updated;
        },

        updateMany: async ({ model, where, update }: any) => {
            debugLog("updateMany", { model, where, update });

            // Convert Date objects to ISO strings for D1 compatibility
            const processedUpdate = processDateValues(update);

            const query = connection.table(model);
            applyWhere(query, where);

            // Update records and return count
            const count = await query.update(processedUpdate);

            return count;
        },

        delete: async ({ model, where }: any) => {
            debugLog("delete", { model, where });

            const query = connection.table(model);
            applyWhere(query, where);

            await query.delete();
        },

        deleteMany: async ({ model, where }: any) => {
            debugLog("deleteMany", { model, where });

            const query = connection.table(model);
            applyWhere(query, where);

            // Delete records and return count
            const count = await query.delete();

            return count;
        },

        findOne: async ({ model, where, select }: any) => {
            debugLog("findOne", { model, where, select });

            const query = connection.table(model);

            // Apply select if provided
            if (select && select.length > 0) {
                query.select(...select);
            }

            // Apply where conditions
            applyWhere(query, where);

            // Get the first record
            const result = await query.first();

            return result || null;
        },

        findMany: async ({ model, where, limit, offset, sortBy, select }: any) => {
            debugLog("findMany", { model, where, limit, offset, sortBy, select });

            const query = connection.table(model);

            // Apply select if provided
            if (select && select.length > 0) {
                query.select(...select);
            }

            // Apply where conditions
            applyWhere(query, where);

            // Apply limit and offset
            if (limit !== undefined) {
                query.limit(limit);
            }
            if (offset !== undefined) {
                query.offset(offset);
            }

            // Apply sorting
            if (sortBy) {
                // Handle Better Auth format: { field: 'fieldName', direction: 'asc'/'desc' }
                if (sortBy.field && sortBy.direction) {
                    query.orderBy(sortBy.field, sortBy.direction);
                } else {
                    // Handle object format: { fieldName: 'asc'/'desc' }
                    Object.entries(sortBy).forEach(([field, direction]) => {
                        query.orderBy(field, direction as string);
                    });
                }
            }

            // Get all matching records
            const results = await query.get();

            return results;
        },

        count: async ({ model, where }: any) => {
            debugLog("count", { model, where });

            const query = connection.table(model);
            applyWhere(query, where);

            // Get count
            const result = await query.count('* as count');

            // Extract count value
            if (Array.isArray(result) && result.length > 0) {
                const countValue = result[0].count;
                return typeof countValue === 'number' ? countValue : parseInt(countValue as string, 10);
            }

            return 0;
        },
    };
}

/**
 * Applies where conditions to a query
 */
function applyWhere(query: any, where: any) {
    if (!where) return;

    // Handle array format from Better Auth
    if (Array.isArray(where)) {
        where.forEach((condition: any) => {
            const { field, value, operator, connector } = condition;

            // Convert Date objects to ISO strings for D1 compatibility
            const processedValue = value instanceof Date ? value.toISOString() : value;

            // Apply the connector (AND/OR)
            const method = connector === 'OR' ? 'orWhere' : 'where';

            // Apply the operator
            switch (operator) {
                case 'eq':
                    query[method](field, processedValue);
                    break;
                case 'ne':
                    query[method](field, '!=', processedValue);
                    break;
                case 'gt':
                    query[method](field, '>', processedValue);
                    break;
                case 'gte':
                    query[method](field, '>=', processedValue);
                    break;
                case 'lt':
                    query[method](field, '<', processedValue);
                    break;
                case 'lte':
                    query[method](field, '<=', processedValue);
                    break;
                case 'in':
                    const inMethod = connector === 'OR' ? 'orWhereIn' : 'whereIn';
                    // Process array values in case they contain dates
                    const inValues = Array.isArray(value)
                        ? value.map(v => v instanceof Date ? v.toISOString() : v)
                        : value;
                    query[inMethod](field, inValues);
                    break;
                case 'notIn':
                    const notInMethod = connector === 'OR' ? 'orWhereNotIn' : 'whereNotIn';
                    // Process array values in case they contain dates
                    const notInValues = Array.isArray(value)
                        ? value.map(v => v instanceof Date ? v.toISOString() : v)
                        : value;
                    query[notInMethod](field, notInValues);
                    break;
                case 'contains':
                    query[method](field, 'like', `%${value}%`);
                    break;
                case 'startsWith':
                    query[method](field, 'like', `${value}%`);
                    break;
                case 'endsWith':
                    query[method](field, 'like', `%${value}`);
                    break;
                case 'null':
                    const nullMethod = connector === 'OR' ? 'orWhereNull' : 'whereNull';
                    query[nullMethod](field);
                    break;
                case 'notNull':
                    const notNullMethod = connector === 'OR' ? 'orWhereNotNull' : 'whereNotNull';
                    query[notNullMethod](field);
                    break;
                default:
                    // Default to equals
                    query[method](field, value);
            }
        });
        return;
    }

    // Handle object format (for backward compatibility with tests)
    Object.entries(where).forEach(([key, value]) => {
        // Convert Date objects to ISO strings
        const processedValue = value instanceof Date ? value.toISOString() : value;

        if (value === null) {
            query.whereNull(key);
        } else if (value === undefined) {
            // Skip undefined values
        } else if (value instanceof Date) {
            query.where(key, processedValue);
        } else if (typeof value === 'object' && value !== null) {
            // Handle complex where conditions
            if ('in' in value) {
                const inVals = Array.isArray(value.in)
                    ? value.in.map((v: any) => v instanceof Date ? v.toISOString() : v)
                    : value.in;
                query.whereIn(key, inVals);
            } else if ('notIn' in value) {
                const notInVals = Array.isArray(value.notIn)
                    ? value.notIn.map((v: any) => v instanceof Date ? v.toISOString() : v)
                    : value.notIn;
                query.whereNotIn(key, notInVals);
            } else if ('gt' in value) {
                const gtVal = value.gt instanceof Date ? value.gt.toISOString() : value.gt;
                query.where(key, '>', gtVal);
            } else if ('gte' in value) {
                const gteVal = value.gte instanceof Date ? value.gte.toISOString() : value.gte;
                query.where(key, '>=', gteVal);
            } else if ('lt' in value) {
                const ltVal = value.lt instanceof Date ? value.lt.toISOString() : value.lt;
                query.where(key, '<', ltVal);
            } else if ('lte' in value) {
                const lteVal = value.lte instanceof Date ? value.lte.toISOString() : value.lte;
                query.where(key, '<=', lteVal);
            } else if ('ne' in value) {
                const neVal = value.ne instanceof Date ? value.ne.toISOString() : value.ne;
                query.where(key, '!=', neVal);
            } else if ('contains' in value) {
                query.where(key, 'like', `%${value.contains}%`);
            } else if ('startsWith' in value) {
                query.where(key, 'like', `${value.startsWith}%`);
            } else if ('endsWith' in value) {
                query.where(key, 'like', `%${value.endsWith}`);
            } else {
                // Default to equals
                query.where(key, processedValue);
            }
        } else {
            // Simple equality
            query.where(key, processedValue);
        }
    });
}

/**
 * Generates a unique ID
 */
function generateId(): string {
    return crypto.randomUUID();
}

/**
 * Processes date values in an object, converting Date instances to ISO strings
 */
function processDateValues(obj: any): any {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const processed: any = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Date) {
            processed[key] = value.toISOString();
        } else if (Array.isArray(value)) {
            processed[key] = value.map(v => v instanceof Date ? v.toISOString() : v);
        } else {
            processed[key] = value;
        }
    }
    return processed;
}
