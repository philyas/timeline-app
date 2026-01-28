import path from 'path';
import knex, { Knex } from 'knex';
import { getDbConfig, getDbConfigSummary } from './dbConfig';

let knexInstance: Knex | null = null;

export function getKnex(): Knex {
  if (!knexInstance) {
    const config = getDbConfig();
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const connection = config.connectionString
      ? config.connectionString
      : ({
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.user,
          password: config.password,
        } as Record<string, unknown>);
    if (typeof connection === 'object' && config.ssl) (connection as Record<string, unknown>).ssl = config.ssl;
    knexInstance = knex({
      client: 'pg',
      connection,
      pool: { min: 0, max: config.poolMax ?? 5 },
      acquireConnectionTimeout: config.acquireConnectionTimeout ?? 10000,
      migrations: {
        directory: migrationsDir,
        tableName: 'knex_migrations',
      },
    });
  }
  return knexInstance;
}

export async function connectDatabase(): Promise<void> {
  console.log(getDbConfigSummary());
  const k = getKnex();
  await k.raw('select 1');
  console.log('Database connection established.');
}

export async function runMigrations(): Promise<void> {
  const k = getKnex();
  await k.migrate.latest();
  console.log('Knex migrations completed.');
}
