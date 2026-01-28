import path from 'path';
import knex, { Knex } from 'knex';
import { getDbConfig } from './dbConfig';

let knexInstance: Knex | null = null;

export function getKnex(): Knex {
  if (!knexInstance) {
    const config = getDbConfig();
    const migrationsDir = path.join(process.cwd(), 'migrations');
    knexInstance = knex({
      client: 'pg',
      connection: {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
      },
      pool: { min: 0, max: 5 },
      migrations: {
        directory: migrationsDir,
        tableName: 'knex_migrations',
      },
    });
  }
  return knexInstance;
}

export async function connectDatabase(): Promise<void> {
  const k = getKnex();
  await k.raw('select 1');
  console.log('Database connection established.');
}

export async function runMigrations(): Promise<void> {
  const k = getKnex();
  await k.migrate.latest();
  console.log('Knex migrations completed.');
}
