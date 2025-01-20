require('dotenv').config();

let connection;
switch (process.env.CONNECTION_TYPE) {
  case 'd1':
    connection = {
      client: require('cloudflare-d1-http-knex').CloudflareD1HttpClient,
      connection: {
        account_id: process.env.CF_ACCOUNT_ID,
        database_id: process.env.CF_DATABASE_ID,
        key: process.env.CF_AUTH_KEY,
      }
    };
    break;
  case 'turso':
    connection = {
      client: require('@libsql/knex-libsql'),
      connection: {
        filename: `${process.env.TURSO_DATABASE}?authToken=${process.env.TURSO_AUTH_TOKEN}`
      }
    };
    break;
  default:
    connection = {
      client: 'mysql2',
      connection: {
        host: process.env.DB_HOST ?? 'localhost',
        port: process.env.DB_PORT ?? 3306,
        user: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME ?? 'sutando',
      }
    }
}

module.exports = {
  ...connection,
  useNullAsDefault: true,
  migrations: {
    table: 'migrations',
    path: './db/migrations',
  },
  models: {
    path: './models'
  }
}; 