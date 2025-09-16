import { defineNuxtPlugin } from 'nuxt/app';
import { sutando } from 'sutando';
import config from '../sutando.config.cjs';

export default defineNuxtPlugin(async nuxtApp => {
    // Add database connection configuration
    Object.entries(config.connections).forEach(([name, connection]) => {
        sutando.addConnection(connection, name);
    });

    return {
        provide: {
            sutando
        }
    }
}) 