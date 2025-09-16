const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.createTable("users", (table) => {
      table.string("id").primary().notNullable();
      table.string("name").notNullable();
      table.string("email").notNullable().unique();
      table.integer("email_verified").notNullable();
      table.string("image");
      table.date("created_at").notNullable();
      table.date("updated_at").notNullable();
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    await schema.dropTableIfExists("users");
  }
};
