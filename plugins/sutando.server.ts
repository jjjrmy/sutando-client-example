import { sutando } from 'sutando';
import config from '../sutando.config.cjs';

export default defineNuxtPlugin(async () => {
    console.log('Adding connections', config.connections);
    // Add database connection configuration
    Object.entries(config.connections).forEach(([name, connection]) => {
        console.log('Adding connection', name, connection);
        sutando.addConnection(connection, name);
    });

    return {
        provide: {
            sutando
        }
    }
}) 