import nodemailer from 'nodemailer';

type MailInput = { to: string; subject: string; html?: string; text?: string };

export async function sendMail({ to, subject, html, text }: MailInput) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER as string, pass: process.env.SMTP_PASS as string } : undefined,
  });

  const from = process.env.MAIL_FROM || `Tvoje Hnízdo <no-reply@${process.env.MAIL_DOMAIN ?? 'tvojehnizdo.com'}>`;
  await transporter.sendMail({ from, to, subject, html, text });
  return { ok: true };
}
