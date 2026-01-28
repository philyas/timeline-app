/**
 * Löscht alle User (und per FK abhängige Daten: Tokens, Timelines, Events, Event-Images).
 * Nutzt .env / knexfile (USE_PROD_DB, DB_* bzw. PROD_DB_*).
 *
 * Usage: node scripts/delete-all-users.js   (von backend/-Verzeichnis)
 */

require('dotenv').config({ path: require('path').join(process.cwd(), '.env') });
const knex = require('knex')(require('../knexfile'));

async function run() {
  try {
    const count = await knex('users').count('* as n').first();
    const n = parseInt(count?.n ?? '0', 10);
    if (n === 0) {
      console.log('Keine User vorhanden.');
      process.exit(0);
      return;
    }

    await knex('event_images').del();
    await knex('events').del();
    await knex('timelines').del();
    await knex('email_verification_tokens').del();
    await knex('password_reset_tokens').del();
    const deleted = await knex('users').del();

    console.log(`${deleted} User gelöscht.`);
  } catch (err) {
    console.error('Fehler:', err.message || err);
    process.exit(1);
  } finally {
    await knex.destroy();
  }
}

run();
