import { sutando } from "sutando";

export default defineNitroPlugin(async (nitroApp) => {
    nitroApp.hooks.hook('request', async (event) => {
        if (!event.context.cloudflare?.env?.DB) return;

        try {
            const knex = await import("knex").then(m => m.default || m);
            sutando.setConnectorFactory(knex);

            const ClientD1 = await import("knex-cloudflare-d1").then(m => m.default);
            sutando.addConnection({
                client: ClientD1,
                connection: { database: event.context.cloudflare.env.DB },
                useNullAsDefault: true,
            });
        } catch (error) {
            console.error("Failed to initialize Sutando with D1:", error);
        }
    });
});