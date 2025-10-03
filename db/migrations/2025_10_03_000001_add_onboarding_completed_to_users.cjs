const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.alterTable("users", (table) => {
      table.string("username").nullable();
      table.string("biography").nullable();
      table.timestamp("onboarding_completed_at").nullable();
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    await schema.alterTable("users", (table) => {
      table.dropColumn("username");
      table.dropColumn("biography");
      table.dropColumn("onboarding_completed_at");
    });
  }
};
