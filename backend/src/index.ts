import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, runMigrations } from './config/knex';
import routes from './routes';
import { seed } from './seeders/initData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use('/api', routes);

app.get('/', (_req, res) => {
  res.json({ name: 'Timeline API', version: '1.0.0' });
});

async function start(): Promise<void> {
  try {
    await connectDatabase();
    await runMigrations();
    if (process.env.SEED_ON_START === 'true') {
      await seed();
    }
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
