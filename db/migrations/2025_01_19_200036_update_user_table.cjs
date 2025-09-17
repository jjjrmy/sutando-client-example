const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.table("users", (table) => {
      table.string("phoneNumber").nullable();
      table.boolean("phoneNumberVerified").defaultTo(false);
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    await schema.table("users", (table) => {
      table.dropColumn("phoneNumber");
      table.dropColumn("phoneNumberVerified");
    });
  }
};
