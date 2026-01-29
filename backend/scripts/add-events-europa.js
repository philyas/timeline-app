/**
 * Fügt ca. 30 Events zur Timeline "Europa" hinzu (per E-Mail), alle in einem Jahr mit Monat/Tag.
 * Nutzt .env; für Prod: --prod (PROD_DB_* / PROD_DB_URL).
 *
 * Usage (lokal gegen Prod-DB):
 *   node scripts/add-events-europa.js --prod
 *
 * Usage (auf Render/im Container, DB ist bereits Prod):
 *   node scripts/add-events-europa.js
 *
 * User-E-Mail und Timeline-Name sind im Script konfigurierbar.
 */

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

if (process.argv.includes('--prod')) {
  process.env.USE_PROD_DB = 'true';
}

const knex = require('knex')(require('../knexfile'));

const USER_EMAIL = 'philyasmalik@gmail.com';
const TIMELINE_NAME = 'Europa'; // oder Slug z.B. "europa"

// 30 Europa-Events in einem Jahr (1989 – Wendejahr), jeweils mit Monat und Tag
const EVENTS = [
  { title: 'Ungarn erlaubt Mehrparteien-System', description: 'Ungarn beschließt politische Reformen.', year: 1989, month: 1, day: 11, isImportant: false },
  { title: 'Solidarność in Polen wieder zugelassen', description: 'Runder Tisch; Gewerkschaft wird legalisiert.', year: 1989, month: 2, day: 6, isImportant: true },
  { title: 'Gorbatschow in London', description: 'Sowjetischer Staatschef besucht Großbritannien.', year: 1989, month: 3, day: 7, isImportant: false },
  { title: 'Wahlen in der Sowjetunion', description: 'Erste halbwegs freie Wahlen zum Kongress.', year: 1989, month: 3, day: 26, isImportant: false },
  { title: 'Ungarn öffnet Grenze zu Österreich', description: 'Abbau des Grenzzauns; Fluchtweg für DDR-Bürger.', year: 1989, month: 5, day: 2, isImportant: true },
  { title: 'Tiananmen-Proteste (Europa reagiert)', description: 'Europäische Reaktion auf Ereignisse in China.', year: 1989, month: 6, day: 4, isImportant: false },
  { title: 'Polnische Parlamentswahlen', description: 'Sieg der Solidarność; erster nicht-kommunistischer Block.', year: 1989, month: 6, day: 4, isImportant: true },
  { title: 'Gorbatschow in Bonn', description: 'Besuch in der Bundesrepublik; Annäherung West–Ost.', year: 1989, month: 6, day: 12, isImportant: false },
  { title: 'Imre Nagy in Ungarn rehabilitiert', description: 'Staatsbegräbnis für 1956 hingerichteten Reformpolitiker.', year: 1989, month: 6, day: 16, isImportant: false },
  { title: 'Österreich beantragt EG-Beitritt', description: 'Antrag auf Mitgliedschaft in der Europäischen Gemeinschaft.', year: 1989, month: 7, day: 17, isImportant: false },
  { title: 'Baltische Menschenkette', description: 'Millionen bilden Kette durch Estland, Lettland, Litauen.', year: 1989, month: 8, day: 23, isImportant: true },
  { title: 'Tadeusz Mazowiecki Ministerpräsident Polen', description: 'Erster nicht-kommunistischer Regierungschef im Ostblock.', year: 1989, month: 8, day: 24, isImportant: true },
  { title: 'Ungarische Flüchtlinge in DDR-Botschaften', description: 'DDR-Bürger nutzen Urlaub in Ungarn zur Flucht.', year: 1989, month: 9, day: 10, isImportant: false },
  { title: 'Ungarn öffnet Grenze für DDR-Flüchtlinge', description: 'Durchreise in den Westen wird erlaubt.', year: 1989, month: 9, day: 11, isImportant: true },
  { title: 'Montagsdemonstrationen in Leipzig', description: '„Wir sind das Volk“ – wöchentliche Proteste.', year: 1989, month: 9, day: 25, isImportant: true },
  { title: 'Gorbatschow in Ost-Berlin', description: '„Wer zu spät kommt, den bestraft das Leben.“', year: 1989, month: 10, day: 7, isImportant: false },
  { title: 'Leipzig: 70.000 bei Montagsdemo', description: 'Größte Demonstration bis dahin in der DDR.', year: 1989, month: 10, day: 9, isImportant: true },
  { title: 'Honecker tritt zurück', description: 'Egon Krenz wird neuer SED-Generalsekretär.', year: 1989, month: 10, day: 18, isImportant: true },
  { title: 'Prag: DDR-Flüchtlinge in Botschaft', description: 'Tausende suchen Zuflucht in der BRD-Botschaft.', year: 1989, month: 10, day: 3, isImportant: false },
  { title: 'DDR öffnet Grenze zur ČSSR', description: 'Flüchtlinge dürfen in den Westen ausreisen.', year: 1989, month: 11, day: 1, isImportant: false },
  { title: 'Großdemo in Ost-Berlin', description: 'Hunderttausende fordern Reisefreiheit und Reformen.', year: 1989, month: 11, day: 4, isImportant: false },
  { title: 'Rücktritt des DDR-Ministerrats', description: 'Regierung tritt geschlossen zurück.', year: 1989, month: 11, day: 7, isImportant: false },
  { title: 'Fall der Berliner Mauer', description: 'Grenze öffnet sich; Mauerfall in der Nacht zum 10.11.', year: 1989, month: 11, day: 9, isImportant: true },
  { title: 'Bulgarien: Sturz von Schiwkow', description: 'Langjähriger Parteichef wird abgelöst.', year: 1989, month: 11, day: 10, isImportant: false },
  { title: 'ČSSR: Samtene Revolution beginnt', description: 'Massenproteste gegen das Regime in Prag.', year: 1989, month: 11, day: 17, isImportant: true },
  { title: 'Václav Havel in der Tschechoslowakei', description: 'Dramatiker wird zur Symbolfigur der Revolution.', year: 1989, month: 11, day: 19, isImportant: false },
  { title: 'Rumänien: Aufstand in Timișoara', description: 'Proteste gegen Ceaușescu; blutige Unterdrückung.', year: 1989, month: 12, day: 16, isImportant: true },
  { title: 'Ceaușescu flieht aus Bukarest', description: 'Diktator flieht; wird kurz darauf verhaftet.', year: 1989, month: 12, day: 22, isImportant: true },
  { title: 'Havel Präsident der ČSSR', description: 'Einigung auf demokratischen Übergang.', year: 1989, month: 12, day: 29, isImportant: true },
  { title: 'Schengener Abkommen unterzeichnet', description: 'Reisefreiheit zwischen mehreren EG-Staaten.', year: 1989, month: 12, day: 19, isImportant: false },
];

async function run() {
  try {
    const user = await knex('users').where({ email: USER_EMAIL }).first();
    if (!user) {
      console.error('User nicht gefunden:', USER_EMAIL);
      process.exit(1);
    }
    const userId = user.id;
    console.log('User gefunden: id=', userId);

    const timeline = await knex('timelines')
      .where({ user_id: userId })
      .where(function () {
        this.where('name', 'ilike', TIMELINE_NAME).orWhere('slug', 'ilike', TIMELINE_NAME.toLowerCase().replace(/\s+/g, '-'));
      })
      .first();

    if (!timeline) {
      console.error('Timeline "', TIMELINE_NAME, '" für diesen User nicht gefunden.');
      process.exit(1);
    }
    const timelineId = timeline.id;
    console.log('Timeline gefunden: id=', timelineId, ', name=', timeline.name);

    for (const ev of EVENTS) {
      await knex('events').insert({
        timeline_id: timelineId,
        title: ev.title,
        description: ev.description || null,
        year: ev.year,
        month: ev.month ?? null,
        day: ev.day ?? null,
        is_important: ev.isImportant ?? false,
      });
      console.log('  +', ev.year, ev.title);
    }
    console.log('Fertig: ' + EVENTS.length + ' Events hinzugefügt.');
  } catch (err) {
    console.error('Fehler:', err.message || err);
    process.exit(1);
  } finally {
    await knex.destroy();
  }
}

run();
