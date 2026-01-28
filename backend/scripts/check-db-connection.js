/**
 * Verbindungscheck zur DB (Prod oder Lokal je nach USE_PROD_DB in .env).
 * Usage: npm run db:check   oder   node scripts/check-db-connection.js
 * Von backend/-Verzeichnis aus ausführen.
 */

require('dotenv').config({ path: require('path').join(process.cwd(), '.env') });
const { Client } = require('pg');

function useProdDb() {
  const v = (process.env.USE_PROD_DB || '').toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

const prod = useProdDb();
const prodUrl = (process.env.PROD_DB_URL || '').trim();
const timeoutMs = prod
  ? parseInt(process.env.PROD_DB_ACQUIRE_TIMEOUT || '60000', 10)
  : 10000;

let config;

if (prod && prodUrl) {
  config = {
    connectionString: prodUrl,
    connectionTimeoutMillis: timeoutMs,
  };
} else {
  const p = prod ? 'PROD_DB_' : 'DB_';
  config = {
    host: process.env[p + 'HOST'] ?? (prod ? '' : 'localhost'),
    port: parseInt(process.env[p + 'PORT'] ?? '5432', 10),
    database: process.env[p + 'NAME'] ?? (prod ? '' : 'timeline_app'),
    user: process.env[p + 'USER'] ?? (prod ? '' : 'timeline_user'),
    password: process.env[p + 'PASSWORD'] ?? (prod ? '' : 'timeline_password'),
    connectionTimeoutMillis: timeoutMs,
  };
  const prodSsl =
    (process.env.PROD_DB_SSL || '').toLowerCase() === 'true' ||
    process.env.PROD_DB_SSL === '1';
  if (prod && prodSsl) {
    config.ssl = { rejectUnauthorized: false };
  }
}

const mode = prod ? 'PROD' : 'lokal';
console.log(`\n DB-Verbindungscheck (${mode})`);
if (config.connectionString) {
  const masked = config.connectionString.replace(/:([^:@]+)@/, ':****@');
  console.log(`   Connection string: ${masked}`);
} else {
  console.log(`   Host: ${config.host}:${config.port}  DB: ${config.database}  User: ${config.user}`);
  if (prod && config.ssl) console.log('   SSL: an');
}
console.log(`   Timeout: ${timeoutMs / 1000}s`);
console.log('');

const client = new Client(config);

client
  .connect()
  .then(() => client.query('SELECT 1 as ok'))
  .then((res) => {
    if (res.rows[0]?.ok === 1) {
      console.log(' ✓ Verbindung OK.\n');
      return client.query('SELECT version()').then((v) => {
        console.log('   ' + (v.rows[0]?.version || '').split('\n')[0] + '\n');
      });
    }
  })
  .then(() => client.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(' ✗ Verbindung fehlgeschlagen:\n   ' + (err.message || err) + '\n');
    const msg = String(err.message || err);
    const isTimeout = /timeout|ETIMEDOUT|timed out/i.test(msg);
    const isTenantUser = /tenant or user not found/i.test(msg);
    const hostOrUrl = config.connectionString || config.host || '';
    const isSupabase = prod && /supabase\.co|pooler\.supabase/i.test(String(hostOrUrl));
    if (isSupabase) {
      if (isTimeout) {
        console.error(
          '   Supabase: Direct (5432) nutzt IPv6 → oft Timeout ohne IPv6.\n' +
            '   → Transaction-Pooler: PROD_DB_PORT=6543, PROD_DB_USER=postgres.\n' +
            '   → Oder Session-Pooler (andere Host/User). Projekt pausiert? Im Dashboard prüfen.\n'
        );
      } else if (isTenantUser) {
        console.error(
          '   Supabase-Pooler: Bei Port 6543 (Transaction) PROD_DB_USER=postgres verwenden.\n' +
            '   Bei Session-Pooler (5432) User postgres.PROJECT_REF (z.B. postgres.xxx).\n'
        );
      }
    }
    client.end().catch(() => {});
    process.exit(1);
  });
