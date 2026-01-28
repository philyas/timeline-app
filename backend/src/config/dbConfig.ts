import dotenv from 'dotenv';

dotenv.config();

export function getDbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'timeline_app',
    user: process.env.DB_USER || 'timeline_user',
    password: process.env.DB_PASSWORD || 'timeline_password',
  };
}
