/**
 * Löscht alle User (und per FK abhängige Daten: Tokens, Timelines, Events, Event-Images).
 * Nutzt .env / knexfile (DB_* bzw. PROD_DB_* wenn --prod).
 *
 * Usage (lokal, Dev-DB):
 *   node scripts/delete-all-users.js
 *
 * Usage (Production-DB, z.B. von lokal aus):
 *   node scripts/delete-all-users.js --prod
 *   (setzt USE_PROD_DB=true für diesen Lauf, liest PROD_DB_* / PROD_DB_URL aus .env)
 *
 * Usage (auf Render/im Container):
 *   CONFIRM_DELETE_ALL_USERS=yes node scripts/delete-all-users.js
 *   (dort ist DB bereits Prod; --prod nicht nötig)
 */

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

// Prod-Flag: --prod nutzt PROD_DB_* aus .env
if (process.argv.includes('--prod')) {
  process.env.USE_PROD_DB = 'true';
}

const knex = require('knex')(require('../knexfile'));

const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
const confirmed = (process.env.CONFIRM_DELETE_ALL_USERS || '').toLowerCase() === 'yes';

async function run() {
  try {
    if (isProd && !confirmed) {
      console.error('In Production: CONFIRM_DELETE_ALL_USERS=yes setzen.');
      console.error('Beispiel: CONFIRM_DELETE_ALL_USERS=yes node scripts/delete-all-users.js');
      process.exit(1);
    }

    const count = await knex('users').count('* as n').first();
    const n = parseInt(count?.n ?? '0', 10);
    if (n === 0) {
      console.log('Keine User vorhanden.');
      process.exit(0);
      return;
    }

    if (process.env.USE_PROD_DB === 'true' || isProd) {
      console.log('Lösche ' + n + ' User und zugehörige Daten …');
    }

    await knex('event_images').del();
    await knex('events').del();
    await knex('timelines').del();
    await knex('email_verification_tokens').del();
    await knex('password_reset_tokens').del();
    const deleted = await knex('users').del();

    console.log(deleted + ' User gelöscht.');
  } catch (err) {
    console.error('Fehler:', err.message || err);
    process.exit(1);
  } finally {
    await knex.destroy();
  }
}

run();
