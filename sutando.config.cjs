const ClientD1 = require("knex-cloudflare-d1");

const connections = {
  default: {
    client: ClientD1,
    connection: {
      database: "test-sutando",
      // remote: true, // this needs to be true for remote
    },
    useNullAsDefault: true,
  },
};

module.exports = {
  connections,
  useNullAsDefault: true,
  migrations: {
    table: "migrations",
    path: "./db/migrations",
  },
  models: {
    path: "./models",
  },
};
