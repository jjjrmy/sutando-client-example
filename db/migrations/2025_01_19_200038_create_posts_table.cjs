const { Migration, sutando } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.connection('secondary').createTable("posts", (table) => {
      table.increments("id");
      table.integer("user_id").unsigned().notNullable();
      table.string("title", 30);
      table.string("content");
      table.timestamps();

      // table.foreign("user_id").references("id").inTable("users");
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    await schema.connection('secondary').dropTableIfExists("posts");
  }
};
