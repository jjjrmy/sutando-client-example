const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.createTable("accounts", (table) => {
      table.string("id").primary().notNullable();
      table.string("account_id").notNullable();
      table.string("provider_id").notNullable();
      table
        .string("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("access_token");
      table.string("refresh_token");
      table.string("id_token");
      table.date("access_token_expires_at");
      table.date("refresh_token_expires_at");
      table.string("scope");
      table.string("password");
      table.date("created_at").notNullable();
      table.date("updated_at").notNullable();
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    // Drop foreign key constraints first
    await schema.table("accounts", (table) => {
      table.dropForeign(["user_id"]);
    });
    // Then drop the table
    await schema.dropTableIfExists("accounts");
  }
};
