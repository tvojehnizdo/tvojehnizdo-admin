import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST!;
const user = process.env.SMTP_USER!;
const pass = process.env.SMTP_PASS!;
const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
const port = Number(process.env.SMTP_PORT || 587);

function createTransport(p: number, secure: boolean) {
  return nodemailer.createTransport({
    host,
    port: p,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: true },
  });
}

export async function sendMail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    const t = createTransport(587, false); // STARTTLS
    const info = await t.sendMail({ from, to, subject, text, html });
    return { ok: true, info };
  } catch (e587) {
    try {
      const t = createTransport(465, true); // SSL fallback
      const info = await t.sendMail({ from, to, subject, text, html });
      return { ok: true, info, fallback: true };
    } catch (e465) {
      return { ok: false, error: e465, tried587: e587 };
    }
  }
}
