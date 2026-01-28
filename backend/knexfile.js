require('dotenv').config({ path: require('path').join(process.cwd(), '.env') });

function useProdDb() {
  const v = (process.env.USE_PROD_DB || '').toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

const prod = useProdDb();
const prodUrl = (process.env.PROD_DB_URL || '').trim();

let connection;
let acquireTimeout = 10000;
let poolMax = 5;

if (prod && prodUrl) {
  connection = prodUrl;
  acquireTimeout = parseInt(process.env.PROD_DB_ACQUIRE_TIMEOUT || '30000', 10);
  poolMax = 2;
} else {
  const p = prod ? 'PROD_DB_' : 'DB_';
  const dbHost = process.env[p + 'HOST'] ?? (prod ? '' : 'localhost');
  const dbPort = process.env[p + 'PORT'] ?? '5432';
  const dbName = process.env[p + 'NAME'] ?? (prod ? '' : 'timeline_app');
  const dbUser = process.env[p + 'USER'] ?? (prod ? '' : 'timeline_user');
  const dbPassword = process.env[p + 'PASSWORD'] ?? (prod ? '' : 'timeline_password');
  const prodSsl = (process.env.PROD_DB_SSL || '').toLowerCase() === 'true' || process.env.PROD_DB_SSL === '1';
  acquireTimeout = prod ? parseInt(process.env.PROD_DB_ACQUIRE_TIMEOUT || '30000', 10) : 10000;
  poolMax = prod ? 2 : 5;
  connection = {
    host: dbHost,
    port: parseInt(dbPort, 10),
    database: dbName,
    user: dbUser,
    password: dbPassword,
  };
  if (prod && prodSsl) {
    connection.ssl = { rejectUnauthorized: false };
  }
}

module.exports = {
  client: 'pg',
  connection,
  pool: { min: 0, max: poolMax },
  acquireConnectionTimeout: acquireTimeout,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
};
