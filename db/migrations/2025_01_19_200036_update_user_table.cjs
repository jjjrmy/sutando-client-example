const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.table("users", (table) => {
      table.string("phone_number").nullable();
      table.boolean("phone_number_verified").defaultTo(false);
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    await schema.table("users", (table) => {
      table.dropColumn("phone_number");
      table.dropColumn("phone_number_verified");
    });
  }
};
