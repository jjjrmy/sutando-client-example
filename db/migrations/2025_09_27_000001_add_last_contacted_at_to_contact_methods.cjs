const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.table("contact_methods", (table) => {
      // Add the last_contacted_at column as nullable timestamp
      table.timestamp("last_contacted_at").nullable();
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    await schema.table("contact_methods", (table) => {
      table.dropColumn("last_contacted_at");
    });
  }
};
