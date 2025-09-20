import { sutando } from "sutando";
import path from "node:path";
import { pathToFileURL } from "node:url";

export default defineNitroPlugin(async (nitroApp) => {
    nitroApp.hooks.hook('request', async (event) => {
        if (!event.context.cloudflare?.env?.DB) return;

        try {
            const knex = await import("knex").then(m => m.default || m);
            sutando.setConnectorFactory(knex);

            const configPath = path.resolve(process.cwd(), 'sutando.config.cjs');
            const config = await import(pathToFileURL(configPath).href);
            const loadedConnections = (config?.default || config)?.connections;

            if (!loadedConnections)
                throw new Error("Failed to initialize Sutando: no 'connections' found in sutando.config.js");

            Object.entries(loadedConnections).forEach(([name, connection]: [string, any]) => {
                sutando.addConnection({
                    client: connection.client,
                    connection: {
                        database: event.context.cloudflare.env[connection.connection.binding],
                    },
                    useNullAsDefault: connection.useNullAsDefault,
                }, name);
            });
        } catch (error) {
            console.error("Failed to initialize Sutando with D1:", error);
        }
    });
});