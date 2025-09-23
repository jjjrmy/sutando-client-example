const { Migration } = require("sutando");
const knex = require("knex");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    // Create subscription table
    await schema.createTable("subscription", (table) => {
      table.string("id").primary().notNullable();
      table.string("plan").notNullable();
      table.string("referenceId").notNullable();
      table.string("stripeCustomerId");
      table.string("stripeSubscriptionId");
      table.string("status").notNullable();
      table.date("periodStart");
      table.date("periodEnd");
      table.boolean("cancelAtPeriodEnd");
      table.integer("seats");
      table.date("trialStart");
      table.date("trialEnd");
      table.timestamps(true, true, true);
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    // Drop subscription table first
    await schema.dropTableIfExists("subscription");
  }
};
