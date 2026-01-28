import nodemailer from 'nodemailer';
import { getEmailTransporter, getAppUrl, getSmtpFrom } from '../config/email';

export async function sendVerificationEmail(email: string, token: string, name?: string | null): Promise<void> {
  const transport = await getEmailTransporter();
  const appUrl = getAppUrl();
  const link = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const displayName = name || email;

  const info = await transport.sendMail({
    from: getSmtpFrom(),
    to: email,
    subject: 'E-Mail-Adresse bestätigen – Timeline',
    text: `Hallo ${displayName},\n\nbitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:\n\n${link}\n\nDer Link ist 24 Stunden gültig.\n\nViele Grüße,\nDein Timeline-Team`,
    html: `
      <p>Hallo ${displayName},</p>
      <p>bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Der Link ist 24 Stunden gültig.</p>
      <p>Viele Grüße,<br>Dein Timeline-Team</p>
    `,
  });

  if (!process.env.SMTP_HOST && process.env.NODE_ENV !== 'production') {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('[Email] Verification preview:', preview);
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name?: string | null): Promise<void> {
  const transport = await getEmailTransporter();
  const appUrl = getAppUrl();
  const link = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const displayName = name || email;

  const info = await transport.sendMail({
    from: getSmtpFrom(),
    to: email,
    subject: 'Passwort zurücksetzen – Timeline',
    text: `Hallo ${displayName},\n\ndu hast angefordert, dein Passwort zurückzusetzen. Klicke auf den folgenden Link:\n\n${link}\n\nDer Link ist 1 Stunde gültig. Falls du die Anfrage nicht gestellt hast, ignoriere diese E-Mail.\n\nViele Grüße,\nDein Timeline-Team`,
    html: `
      <p>Hallo ${displayName},</p>
      <p>du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den folgenden Link:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Der Link ist 1 Stunde gültig. Falls du die Anfrage nicht gestellt hast, ignoriere diese E-Mail.</p>
      <p>Viele Grüße,<br>Dein Timeline-Team</p>
    `,
  });

  if (!process.env.SMTP_HOST && process.env.NODE_ENV !== 'production') {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('[Email] Password reset preview:', preview);
  }
}
