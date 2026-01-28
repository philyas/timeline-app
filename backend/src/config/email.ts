import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getSmtpConfig(): { host: string; port: number; secure: boolean; user: string; pass: string } | null {
  const host = (process.env.SMTP_HOST ?? '').trim();
  const user = (process.env.SMTP_USER ?? '').trim();
  const pass = (process.env.SMTP_PASSWORD ?? '').trim();
  if (!host || !user || !pass) return null;
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const secure = (process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true';
  return { host, port, secure, user, pass };
}

export async function getEmailTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  const smtp = getSmtpConfig();
  if (smtp) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
      // Port 587: STARTTLS nutzen (Strato)
      requireTLS: !smtp.secure && smtp.port === 587,
      tls: { rejectUnauthorized: true },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });
    return transporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log('[Email] Using Ethereal test account. Preview: https://ethereal.email');
  return transporter;
}

export function getAppUrl(): string {
  const url = (process.env.APP_URL ?? process.env.CORS_ORIGIN ?? 'http://localhost:4200').trim();
  return url.replace(/\/$/, '');
}

export function getSmtpFrom(): string {
  const email = (process.env.SMTP_FROM_EMAIL ?? '').trim();
  const name = (process.env.SMTP_FROM_NAME ?? '').trim();
  if (email && name) return `"${name}" <${email}>`;
  if (email) return email;
  return '"Timeline" <noreply@timeline.app>';
}
