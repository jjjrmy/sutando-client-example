const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.createTable("session", (table) => {
      table.string("id").primary().notNullable();
      table.date("expiresAt").notNullable();
      table.string("token").notNullable().unique();
      table.timestamps(true, true, true);
      table.string("ipAddress");
      table.string("userAgent");
      table
        .string("userId")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    // Drop foreign key constraints first
    await schema.table("session", (table) => {
      table.dropForeign(["userId"]);
    });
    // Then drop the table
    await schema.dropTableIfExists("session");
  }
};
