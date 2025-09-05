import * as nodemailer from "nodemailer";

export type Attachment = { filename: string; content: Buffer | string; contentType?: string };
export type MailInput = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
};

function ensureSmtp() {
  const need = ["SMTP_HOST","SMTP_PORT","SMTP_USER","SMTP_PASS","SMTP_FROM"];
  const miss = need.filter(k => !process.env[k as keyof NodeJS.ProcessEnv]);
  if (miss.length) throw new Error("SMTP not configured: missing " + miss.join(","));
}

export async function sendMail(input: MailInput) {
  ensureSmtp();
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST as string,
    port: Number(process.env.SMTP_PORT || "465"),
    secure: String(process.env.SMTP_PORT || "465") === "465",
    auth: { user: process.env.SMTP_USER as string, pass: process.env.SMTP_PASS as string },
  });
  return transporter.sendMail({ from: `"Tvoje Hnízdo" <${process.env.SMTP_FROM}>`, ...input });
}
