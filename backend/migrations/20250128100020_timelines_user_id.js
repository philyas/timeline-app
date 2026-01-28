/**
 * Timelines werden user-spezifisch. Alte Daten werden entfernt, user_id ergänzt.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex('event_images').del();
  await knex('events').del();
  await knex('timelines').del();

  await knex.schema.alterTable('timelines', (table) => {
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
  });

  await knex.raw('ALTER TABLE timelines DROP CONSTRAINT IF EXISTS timelines_slug_unique');
  await knex.raw('ALTER TABLE timelines DROP CONSTRAINT IF EXISTS timelines_slug_key');
  await knex.schema.alterTable('timelines', (table) => {
    table.unique(['user_id', 'slug']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.raw('ALTER TABLE timelines DROP CONSTRAINT IF EXISTS timelines_user_id_slug_unique');
  await knex.raw('ALTER TABLE timelines DROP CONSTRAINT IF EXISTS timelines_user_id_slug_key');
  await knex.schema.alterTable('timelines', (table) => {
    table.dropColumn('user_id');
  });
  await knex.schema.alterTable('timelines', (table) => {
    table.unique('slug');
  });
};
