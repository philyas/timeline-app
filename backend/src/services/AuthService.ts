import * as crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getKnex } from '../config/knex';
import type { User, UserRow, RegisterDto, LoginDto, ResetPasswordDto, ChangePasswordDto } from '../types/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from './EmailService';

const SALT_ROUNDS = 10;
const VERIFICATION_EXPIRY_HOURS = 24;
const RESET_EXPIRY_HOURS = 1;

function rowToUser(r: UserRow): User {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    emailVerifiedAt: r.email_verified_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function token(): string {
  return crypto.randomBytes(32).toString('hex');
}

export class AuthService {
  async register(dto: RegisterDto): Promise<{ user: User; message: string }> {
    const email = dto.email.trim().toLowerCase();
    if (!email || !dto.password?.trim()) {
      throw new Error('E-Mail und Passwort sind erforderlich.');
    }
    if (dto.password.length < 8) {
      throw new Error('Das Passwort muss mindestens 8 Zeichen haben.');
    }

    const existing = await getKnex()<UserRow>('users').where({ email }).first();
    if (existing) {
      throw new Error('Ein Konto mit dieser E-Mail-Adresse existiert bereits.');
    }

    const passwordHash = await bcrypt.hash(dto.password.trim(), SALT_ROUNDS);
    const [created] = await getKnex()('users')
      .insert({
        email,
        password_hash: passwordHash,
        name: dto.name?.trim() || null,
      })
      .returning('*');
    const user = rowToUser(created as UserRow);

    const verifyToken = token();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_EXPIRY_HOURS);
    await getKnex()('email_verification_tokens').insert({
      user_id: user.id,
      token: verifyToken,
      expires_at: expiresAt,
    });

    await sendVerificationEmail(user.email, verifyToken, user.name);

    return {
      user,
      message: 'Registrierung erfolgreich. Bitte bestätige deine E-Mail-Adresse über den Link in der E-Mail.',
    };
  }

  async login(dto: LoginDto): Promise<{ user: User; token: string }> {
    const email = dto.email.trim().toLowerCase();
    if (!email || !dto.password?.trim()) {
      throw new Error('E-Mail und Passwort sind erforderlich.');
    }

    const row = await getKnex()<UserRow>('users').where({ email }).first();
    if (!row) {
      throw new Error('Ungültige E-Mail oder Passwort.');
    }

    const ok = await bcrypt.compare(dto.password.trim(), row.password_hash);
    if (!ok) {
      throw new Error('Ungültige E-Mail oder Passwort.');
    }

    if (!row.email_verified_at) {
      throw new Error('Bitte bestätige zuerst deine E-Mail-Adresse über den Link in der Registrierungs-E-Mail.');
    }

    const user = rowToUser(row);
    const secret = process.env.JWT_SECRET;
    if (!secret?.trim()) {
      throw new Error('JWT_SECRET ist nicht konfiguriert.');
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: '7d' });

    return { user, token };
  }

  async verifyEmail(tokenVal: string): Promise<User> {
    const t = (tokenVal ?? '').trim();
    if (!t) throw new Error('Token fehlt.');

    const row = await getKnex()<{ user_id: number }>('email_verification_tokens')
      .where('token', t)
      .where('expires_at', '>', getKnex().fn.now())
      .first();
    if (!row) {
      throw new Error('Ungültiger oder abgelaufener Verifizierungslink. Bitte registriere dich erneut oder fordere einen neuen Link an.');
    }

    await getKnex()('users')
      .where({ id: row.user_id })
      .update({ email_verified_at: getKnex().fn.now(), updated_at: getKnex().fn.now() });
    await getKnex()('email_verification_tokens').where('token', t).del();

    const userRow = await getKnex()<UserRow>('users').where({ id: row.user_id }).first();
    if (!userRow) throw new Error('Benutzer nicht gefunden.');
    return rowToUser(userRow);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const e = (email ?? '').trim().toLowerCase();
    if (!e) throw new Error('E-Mail ist erforderlich.');

    const userRow = await getKnex()<UserRow>('users').where({ email: e }).first();
    if (!userRow) {
      return { message: 'Falls ein Konto mit dieser E-Mail existiert, wurde eine E-Mail zum Zurücksetzen des Passworts verschickt.' };
    }

    await getKnex()('password_reset_tokens').where({ user_id: userRow.id }).del();

    const resetToken = token();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESET_EXPIRY_HOURS);
    await getKnex()('password_reset_tokens').insert({
      user_id: userRow.id,
      token: resetToken,
      expires_at: expiresAt,
    });

    await sendPasswordResetEmail(userRow.email, resetToken, userRow.name);

    return { message: 'Falls ein Konto mit dieser E-Mail existiert, wurde eine E-Mail zum Zurücksetzen des Passworts verschickt.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const t = (dto.token ?? '').trim();
    const p = (dto.password ?? '').trim();
    if (!t) throw new Error('Token fehlt.');
    if (!p || p.length < 8) throw new Error('Das Passwort muss mindestens 8 Zeichen haben.');

    const row = await getKnex()<{ user_id: number }>('password_reset_tokens')
      .where('token', t)
      .where('expires_at', '>', getKnex().fn.now())
      .first();
    if (!row) {
      throw new Error('Ungültiger oder abgelaufener Link. Bitte fordere einen neuen Link zum Zurücksetzen des Passworts an.');
    }

    const passwordHash = await bcrypt.hash(p, SALT_ROUNDS);
    await getKnex()('users')
      .where({ id: row.user_id })
      .update({ password_hash: passwordHash, updated_at: getKnex().fn.now() });
    await getKnex()('password_reset_tokens').where('token', t).del();

    return { message: 'Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.' };
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ message: string }> {
    const current = (dto.currentPassword ?? '').trim();
    const next = (dto.newPassword ?? '').trim();
    if (!current) throw new Error('Aktuelles Passwort ist erforderlich.');
    if (!next || next.length < 8) throw new Error('Das neue Passwort muss mindestens 8 Zeichen haben.');

    const row = await getKnex()<UserRow>('users').where({ id: userId }).first();
    if (!row) throw new Error('Benutzer nicht gefunden.');
    const ok = await bcrypt.compare(current, row.password_hash);
    if (!ok) throw new Error('Aktuelles Passwort ist falsch.');

    const passwordHash = await bcrypt.hash(next, SALT_ROUNDS);
    await getKnex()('users')
      .where({ id: userId })
      .update({ password_hash: passwordHash, updated_at: getKnex().fn.now() });
    return { message: 'Passwort wurde geändert.' };
  }

  async getMe(userId: number): Promise<User | null> {
    const row = await getKnex()<UserRow>('users').where({ id: userId }).first();
    if (!row) return null;
    return rowToUser(row);
  }
}
