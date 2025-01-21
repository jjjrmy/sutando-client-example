require('dotenv').config();

const connections = {
  default: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST ?? 'localhost',
      port: process.env.DB_PORT ?? 3306,
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME ?? 'sutando',
    }
  },
  secondary: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST ?? 'localhost',
      port: process.env.DB_PORT ?? 5432,
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME ?? 'sutando',
    }
  }
};

module.exports = {
  connections,
  useNullAsDefault: true,
  migrations: {
    table: 'migrations',
    path: './db/migrations',
  },
  models: {
    path: './models'
  }
}; 