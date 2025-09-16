import { sutando } from 'sutando';

export default defineNuxtPlugin(async () => {
    console.log('Adding sutando plugin');
    const configModule: any = await import('../sutando.config.cjs');
    const config: any = (configModule as any).default ?? configModule;

    const connections: Record<string, any> = (config && config.connections) ? (config.connections as Record<string, any>) : {};
    console.log('Adding connections', connections);
    // Add database connection configuration
    Object.entries(connections).forEach(([name, connection]) => {
        console.log('Adding connection', name, connection);
        sutando.addConnection(connection, name);
    });

    return {
        provide: {
            sutando
        }
    }
}) 