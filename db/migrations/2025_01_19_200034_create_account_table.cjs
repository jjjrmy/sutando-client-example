const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.createTable("account", (table) => {
      table.string("id").primary().notNullable();
      table.string("accountId").notNullable();
      table.string("providerId").notNullable();
      table
        .string("userId")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("accessToken");
      table.string("refreshToken");
      table.string("idToken");
      table.date("accessTokenExpiresAt");
      table.date("refreshTokenExpiresAt");
      table.string("scope");
      table.string("password");
      table.timestamps(true, true, true);
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    // Drop foreign key constraints first
    await schema.table("account", (table) => {
      table.dropForeign(["userId"]);
    });
    // Then drop the table
    await schema.dropTableIfExists("account");
  }
};
