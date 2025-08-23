import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { sendMail } from "@/lib/mailer";
import { logEmailRow } from "@/lib/sheets";

const Schema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });

  const { to, subject, text, html } = parsed.data;
  const dt = new Date().toISOString();

  try {
    const result = await sendMail({ to, subject, text, html });
    if (result.ok) {
      const messageId = (result.info as any)?.messageId || "";
      try {
        await logEmailRow({ datetime: dt, to, subject, status: "OK", messageId });
      } catch (logErr: any) { console.warn("Sheets log failed:", logErr?.message || logErr); }
      return res.status(200).json({ ok: true, messageId, fallback: (result as any).fallback || false });
    } else {
      const errMsg = (result.error as any)?.message || "Unknown SMTP error";
      try { await logEmailRow({ datetime: dt, to, subject, status: "ERROR", error: errMsg }); } catch {}
      return res.status(500).json({ ok: false, error: errMsg });
    }
  } catch (e: any) {
    const errMsg = e?.message || "Unhandled error";
    try { await logEmailRow({ datetime: dt, to, subject, status: "ERROR", error: errMsg }); } catch {}
    return res.status(500).json({ ok: false, error: errMsg });
  }
}
