import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { connectDatabase, runMigrations } from './config/knex';
import routes from './routes';
import { seed } from './seeders/initData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:4200').replace(/\/$/, '');
const UPLOADS = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS)) {
  fs.mkdirSync(UPLOADS, { recursive: true });
}

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use('/uploads', express.static(UPLOADS));
app.use('/api', routes);

app.get('/', (_req, res) => {
  res.json({ name: 'Timeline API', version: '1.0.0' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'Bild zu groß (max. 6 MB).' });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({ error: 'Max. 10 Bilder pro Upload.' });
      return;
    }
  }
  let msg = 'Upload fehlgeschlagen.';
  if (err instanceof Error) msg = err.message;
  res.status(400).json({ error: msg });
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
