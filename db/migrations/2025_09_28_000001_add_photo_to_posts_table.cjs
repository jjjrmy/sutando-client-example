const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.table("posts", (table) => {
      table.string("photo").nullable();
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    await schema.table("posts", (table) => {
      table.dropColumn("photo");
    });
  }
};
