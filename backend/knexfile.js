require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '5432';
const dbName = process.env.DB_NAME || 'timeline_app';
const dbUser = process.env.DB_USER || 'timeline_user';
const dbPassword = process.env.DB_PASSWORD || 'timeline_password';

module.exports = {
  client: 'pg',
  connection: {
    host: dbHost,
    port: parseInt(dbPort, 10),
    database: dbName,
    user: dbUser,
    password: dbPassword,
  },
  pool: { min: 0, max: 5 },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
};
