import { sutando } from "sutando";

export default defineNitroPlugin(async (nitroApp) => {
    nitroApp.hooks.hook('request', async (event) => {
        // Only initialize for CF workers environment
        if (event.context.cloudflare?.env?.DB) {
            try {
                // Import knex dynamically to get the Cloudflare Workers compatible version
                const knex = await import("knex").then(m => m.default || m);

                // Set the connector factory to use the CF Workers compatible Knex
                sutando.setConnectorFactory(knex);

                // Import knex-cloudflare-d1 dynamically 
                const ClientD1 = await import("knex-cloudflare-d1").then(m => m.default);

                // Initialize connection like the working CF D1 example
                sutando.addConnection({
                    client: ClientD1,
                    connection: {
                        database: event.context.cloudflare.env.DB
                    },
                    useNullAsDefault: true,
                });
            } catch (error) {
                console.error("Failed to initialize Sutando with D1:", error);
            }
        } else {
            console.warn("Skipping Sutando initialization, not in CF workers environment");
        }
    });
});