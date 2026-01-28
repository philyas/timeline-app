import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

function useProdDb(): boolean {
  const v = (process.env.USE_PROD_DB ?? '').toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

export interface DbConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: { rejectUnauthorized: boolean };
  acquireConnectionTimeout?: number;
  poolMax?: number;
}

export function getDbConfig(): DbConfig {
  const prod = useProdDb();
  const url = prod ? (process.env.PROD_DB_URL ?? '').trim() : '';

  if (prod && url) {
    const cfg: DbConfig = {
      connectionString: url,
      acquireConnectionTimeout: parseInt(process.env.PROD_DB_ACQUIRE_TIMEOUT ?? '30000', 10),
      poolMax: 2,
    };
    return cfg;
  }

  const prefix = prod ? 'PROD_DB_' : 'DB_';
  const cfg: DbConfig = {
    host: process.env[`${prefix}HOST`] ?? (prod ? '' : 'localhost'),
    port: parseInt(process.env[`${prefix}PORT`] ?? '5432', 10),
    database: process.env[`${prefix}NAME`] ?? (prod ? '' : 'timeline_app'),
    user: process.env[`${prefix}USER`] ?? (prod ? '' : 'timeline_user'),
    password: process.env[`${prefix}PASSWORD`] ?? (prod ? '' : 'timeline_password'),
  };
  if (prod) {
    const sslVal = (process.env.PROD_DB_SSL ?? '').toLowerCase();
    if (sslVal === 'true' || sslVal === '1' || sslVal === 'yes') {
      cfg.ssl = { rejectUnauthorized: false };
    }
    cfg.acquireConnectionTimeout = parseInt(process.env.PROD_DB_ACQUIRE_TIMEOUT ?? '30000', 10);
    cfg.poolMax = 2;
  }
  return cfg;
}
