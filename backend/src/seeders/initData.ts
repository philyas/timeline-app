import { getKnex } from '../config/knex';

/** Seed nur für Auth-relevante Daten. Timelines/Events sind user-spezifisch. */
export async function seed(): Promise<void> {
  const knex = getKnex();
  await knex.raw('select 1');
  console.log('Seed completed (no timeline/event data – user-specific).');
}
