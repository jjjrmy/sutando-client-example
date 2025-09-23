const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    // Add stripeCustomerId to users
    await schema.table("users", (table) => {
      table.string("stripeCustomerId");
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    // Remove stripeCustomerId from users
    await schema.table("users", (table) => {
      table.dropColumn("stripeCustomerId");
    });
  }
};
