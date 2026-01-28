import { getKnex } from '../config/knex';

export async function seed(): Promise<void> {
  const knex = getKnex();

  await knex('timelines')
    .insert({
      name: 'Universum',
      slug: 'universum',
      description: 'Vom Urknall bis heute',
      type: 'custom',
      color: '#1a1a2e',
      sort_order: 0,
    })
    .onConflict('slug')
    .ignore();

  const universeRow = await knex('timelines').where({ slug: 'universum' }).first();
  const universeId = universeRow?.id;
  if (!universeId) return;

  const defaultEvents = [
    { title: 'Urknall', year: -13700000000, description: 'Entstehung des Universums', is_important: true },
    { title: 'Entstehung der Milchstraße', year: -13200000000, description: 'Formation unserer Galaxie', is_important: false },
    { title: 'Entstehung der Erde', year: -4540000000, description: 'Formation unseres Planeten', is_important: true },
    { title: 'Erstes Leben', year: -3800000000, description: 'Früheste bekannte Lebensformen', is_important: true },
    { title: 'Sauerstoffkatastrophe', year: -2400000000, description: 'Große Sauerstoffanreicherung der Atmosphäre', is_important: false },
    { title: 'Erste Mehrzeller', year: -600000000, description: 'Entstehung komplexen Lebens', is_important: true },
    { title: 'Kambrische Explosion', year: -540000000, description: 'Diversifizierung des Lebens', is_important: true },
    { title: 'Aussterben der Dinosaurier', year: -66000000, description: 'Einschlag eines Asteroiden', is_important: true },
    { title: 'Erste Menschen (Homo sapiens)', year: -300000, description: 'Entstehung des modernen Menschen', is_important: true },
    { title: 'Neolithische Revolution', year: -10000, description: 'Beginn von Ackerbau und Sesshaftigkeit', is_important: true },
    { title: 'Schriftliche Überlieferung', year: -3200, description: 'Frühe Schriftkulturen', is_important: true },
    { title: 'Römisches Reich (Gründung Roms)', year: -753, description: 'Traditionelles Gründungsdatum', is_important: false },
    { title: 'Christi Geburt', year: 1, description: 'Beginn der christlichen Zeitrechnung', is_important: true },
    { title: 'Industrielle Revolution', year: 1760, description: 'Beginn der Industrialisierung', is_important: true },
    { title: 'Internet', year: 1983, description: 'Einführung des TCP/IP-Protokolls', is_important: true },
  ];

  for (const ev of defaultEvents) {
    const exists = await knex('events').where({ timeline_id: universeId, title: ev.title }).first();
    if (!exists) {
      await knex('events').insert({
        timeline_id: universeId,
        title: ev.title,
        description: ev.description ?? null,
        year: ev.year,
        is_important: ev.is_important,
      });
    }
  }

  const germany = await knex('timelines').where({ slug: 'deutschland' }).first();
  if (!germany) {
    await knex('timelines').insert({
      name: 'Deutschland',
      slug: 'deutschland',
      description: 'Geschichte Deutschlands',
      type: 'nation',
      color: '#000000',
      sort_order: 1,
    });
  }

  const europe = await knex('timelines').where({ slug: 'europa' }).first();
  if (!europe) {
    await knex('timelines').insert({
      name: 'Europa',
      slug: 'europa',
      description: 'Geschichte Europas',
      type: 'continent',
      color: '#003399',
      sort_order: 2,
    });
  }

  console.log('Seed completed.');
}
