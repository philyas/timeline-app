/**
 * Erweitert year-Spalte für kosmologische Werte (z.B. -13700000000).
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('events', (table) => {
    table.decimal('year', 15, 2).notNullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('events', (table) => {
    table.decimal('year', 12, 2).notNullable().alter();
  });
};
