import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const BASE_UPLOAD_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), 'uploads');
const UPLOAD_DIR = path.join(BASE_UPLOAD_DIR, 'events');
const MAX_SIZE = 6 * 1024 * 1024; // 6MB
const ALLOWED = /\.(jpe?g|png|gif|webp)$/i;

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

interface ReqWithParams { params?: { id?: string } }
interface MulterFileLike { originalname: string }

const storage = multer.diskStorage({
  destination(req: ReqWithParams, _file: MulterFileLike, cb: (e: Error | null, d: string) => void) {
    const eventId = req.params?.id;
    const dir = eventId ? path.join(UPLOAD_DIR, String(eventId)) : UPLOAD_DIR;
    ensureDir(dir);
    cb(null, dir);
  },
  filename(_req: ReqWithParams, file: MulterFileLike, cb: (e: Error | null, n: string) => void) {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = (file.originalname || 'image').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    const name = `${randomUUID()}-${base}${ext}`;
    cb(null, name);
  },
});

function fileFilter(_req: unknown, file: MulterFileLike, cb: FileFilterCallback) {
  if (!ALLOWED.test(file.originalname)) {
    cb(new Error('Nur Bilder (JPEG, PNG, GIF, WebP) erlaubt.'));
    return;
  }
  cb(null, true);
}

export const uploadEventImage = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

export function getUploadsBasePath(): string {
  return process.env.STORAGE_DIR || path.join(process.cwd(), 'uploads');
}

export function getEventImagePath(eventId: number, filename: string): string {
  return path.join(UPLOAD_DIR, String(eventId), filename);
}
