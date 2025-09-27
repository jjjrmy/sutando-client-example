const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.createTable("contact_methods", (table) => {
      table.increments("id");
      table
        .string("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("type").notNullable();
      table.string("token").notNullable();
      table.string("identifier").notNullable();
      table.string("platform").notNullable();
      table.timestamp("expires_at").nullable();
      table.timestamps();

      // Add unique constraint on user_id and identifier combination
      table.unique(["user_id", "identifier"]);
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    // Drop constraints first
    await schema.table("contact_methods", (table) => {
      table.dropUnique(["user_id", "identifier"]);
      table.dropForeign(["user_id"]);
    });
    // Then drop the table
    await schema.dropTableIfExists("contact_methods");
  }
};
