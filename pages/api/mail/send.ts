import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { sendMail } from "@/lib/mailer";
import { logEmailRow } from "@/lib/sheets";

// Pages API v node runtime
export const config = { runtime: "nodejs" } as const;

const Schema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
  from: z.string().optional(),
});

function S(x: unknown): string {
  // bezpečný string (žádné .replace na null/undefined)
  if (x === null || x === undefined) return "";
  return String(x);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const parsed = Schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: "Invalid payload", issues: parsed.error.issues });
    }

    const { to, subject, html, from } = parsed.data;

    // Bezpečné čtení env
    const FROM = S(from) || S(process.env.SMTP_FROM) || "noreply@localhost";
    const result = await sendMail({ to, subject, html, from: FROM });

    // Zaloguj (neblokující)
    try { await logEmailRow({ to, subject, status: result.ok ? "sent" : "error", ts: new Date().toISOString() }); } catch {}

    if (!result.ok) {
      return res.status(500).json({ ok: false, error: result.error ?? "sendMail failed" });
    }
    return res.status(200).json({ ok: true, messageId: result.messageId ?? "dev-stub" });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message ?? "Unhandled error" });
  }
}
