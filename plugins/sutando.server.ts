import { sutando } from 'sutando'

export default defineNuxtPlugin(async () => {
    // Add database connection configuration
    const config = await import('../sutando.config.cjs');
    sutando.addConnection(config.default)

    return {
        provide: {
            sutando
        }
    }
}) 