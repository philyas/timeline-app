/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('events', (table) => {
    table.increments('id').primary();
    table.integer('timeline_id').unsigned().notNullable().references('id').inTable('timelines').onDelete('CASCADE');
    table.string('title', 500).notNullable();
    table.text('description').nullable();
    table.decimal('year', 15, 2).notNullable();
    table.integer('month').nullable();
    table.integer('day').nullable();
    table.boolean('is_important').notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('events');
};
