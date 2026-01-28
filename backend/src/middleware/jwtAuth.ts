import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: number;
  email: string;
}

export interface AuthRequest extends Request {
  userId?: number;
}

export function jwtAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Nicht authentifiziert.' });
    return;
  }

  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    res.status(500).json({ error: 'Serverfehler.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Ungültiger oder abgelaufener Token.' });
  }
}
