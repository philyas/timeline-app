/**
 * Entfernt den Eintrag der fehlenden Migration aus knex_migrations.
 * Ausführen: node scripts/remove-migration-record.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const knex = require('knex')(require('../knexfile.js'));

const NAME = '20250129100000_add_short_codes_to_tokens.js';

knex('knex_migrations')
  .where('name', NAME)
  .del()
  .then((n) => {
    console.log(n ? `Eintrag "${NAME}" gelöscht.` : `Eintrag "${NAME}" war nicht vorhanden.`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => knex.destroy());
