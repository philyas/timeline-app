import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import type { RegisterDto, LoginDto, ResetPasswordDto, ChangePasswordDto } from '../types/auth';
import type { AuthRequest } from '../middleware/jwtAuth';

const authService = new AuthService();

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const dto = req.body as RegisterDto;
    const result = await authService.register(dto);
    res.status(201).json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Registrierung fehlgeschlagen.';
    res.status(400).json({ error: msg });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const dto = req.body as LoginDto;
    const result = await authService.login(dto);
    res.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Anmeldung fehlgeschlagen.';
    res.status(401).json({ error: msg });
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const token = (req.query.token as string) || (req.body?.token as string) || '';
    const user = await authService.verifyEmail(token);
    res.json({ user, message: 'E-Mail-Adresse erfolgreich bestätigt. Du kannst dich jetzt anmelden.' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Verifizierung fehlgeschlagen.';
    res.status(400).json({ error: msg });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const email = (req.body?.email as string) ?? '';
    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Anfrage fehlgeschlagen.';
    res.status(400).json({ error: msg });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const dto = req.body as ResetPasswordDto;
    const result = await authService.resetPassword(dto);
    res.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Passwort konnte nicht zurückgesetzt werden.';
    res.status(400).json({ error: msg });
  }
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const dto = req.body as ChangePasswordDto;
    const result = await authService.changePassword(userId, dto);
    res.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Passwort konnte nicht geändert werden.';
    res.status(400).json({ error: msg });
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const user = await authService.getMe(userId);
    if (!user) {
      res.status(404).json({ error: 'Benutzer nicht gefunden.' });
      return;
    }
    res.json({ user });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Fehler.';
    res.status(500).json({ error: msg });
  }
}
