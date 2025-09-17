const { Migration } = require("sutando");

module.exports = class extends Migration {
  /**
   * Run the migrations.
   */
  async up(schema) {
    await schema.createTable("posts", (table) => {
      table.increments("id");
      table
        .string("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("title", 30);
      table.string("content");
      table.timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  async down(schema) {
    // Drop foreign key constraints first
    await schema.table("posts", (table) => {
      table.dropForeign(["user_id"]);
    });
    // Then drop the table
    await schema.dropTableIfExists("posts");
  }
};
