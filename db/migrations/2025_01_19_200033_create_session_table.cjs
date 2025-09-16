const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.createTable("sessions", (table) => {
      table.string("id").primary().notNullable();
      table.date("expires_at").notNullable();
      table.string("token").notNullable().unique();
      table.date("created_at").notNullable();
      table.date("updated_at").notNullable();
      table.string("ip_address");
      table.string("user_agent");
      table
        .string("user_id")
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
    await schema.table("sessions", (table) => {
      table.dropForeign(["user_id"]);
    });
    // Then drop the table
    await schema.dropTableIfExists("sessions");
  }
};
