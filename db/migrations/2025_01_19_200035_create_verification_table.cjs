const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.createTable("verification", (table) => {
      table.string("id").primary().notNullable();
      table.string("identifier").notNullable();
      table.string("value").notNullable();
      table.date("expiresAt").notNullable();
      table.timestamps(true, true, true);
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    await schema.dropTableIfExists("verification");
  }
};
