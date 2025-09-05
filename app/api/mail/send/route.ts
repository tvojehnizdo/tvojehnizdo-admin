export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "../../../../lib/mailer";
import appendLeadLog from "../../../../lib/sheets";
import { verifyRecaptcha } from "../../../../lib/recaptcha";
import { rateLimit } from "../../../../lib/rateLimit";

type SendType = "lead-confirm" | "lead-internal" | "offer-pdf";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]!));
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rate = rateLimit(ip);
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "Too Many Requests", retryAfter: rate.retryAfter },
      { status: 429 }
    );
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const rec = await verifyRecaptcha(body?.recaptchaToken, ip);
  if (!rec.ok) {
    return NextResponse.json(
      { ok: false, error: rec.error || "reCAPTCHA failed" },
      { status: 400 }
    );
  }

  switch (body?.type as SendType) {
    case "lead-confirm": {
      const to = body?.to;
      const name = body?.name || "";
      if (!to) return NextResponse.json({ ok: false, error: "Missing 'to'" }, { status: 400 });

      await sendMail({
        to,
        subject: "Potvrzení vaší poptávky – Tvoje Hnízdo",
        text: `Dobrý den ${name ? name + "," : ""}\n\nděkujeme za vaši poptávku. Ozveme se co nejdříve.\n\nTým Tvoje Hnízdo`,
        html: `<p>Dobrý den ${name ? name + "," : ""}</p><p>děkujeme za vaši poptávku. Ozveme se co nejdříve.</p><p><strong>Tým Tvoje Hnízdo</strong></p>`,
      });

      await appendLeadLog({
        timeISO: new Date().toISOString(),
        type: "lead-confirm",
        email: to,
      });

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    case "lead-internal": {
      const to = process.env.MAIL_INTERNAL_TO || process.env.SMTP_FROM;
      if (!to) {
        return NextResponse.json(
          { ok: false, error: "Missing MAIL_INTERNAL_TO/SMTP_FROM" },
          { status: 500 }
        );
      }

      const payload = body?.data || {};
      await sendMail({
        to,
        subject: `Nová poptávka${payload?.name ? " – " + payload.name : ""}`,
        html: `<h3>Nová poptávka</h3><pre>${esc(JSON.stringify(payload, null, 2))}</pre>`,
        text: `Nová poptávka\n\n${JSON.stringify(payload, null, 2)}`,
      });

      await appendLeadLog({
        timeISO: new Date().toISOString(),
        type: "lead-internal",
        email: payload.email || payload.mail || "",
        name: payload.name || payload.jmeno || "",
        payload: JSON.stringify(payload),
      });

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    case "offer-pdf": {
      const to = body?.to;
      const pdfBase64 = body?.pdfBase64;
      if (!to || !pdfBase64) {
        return NextResponse.json(
          { ok: false, error: "Missing 'to' or 'pdfBase64'" },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(pdfBase64, "base64");

      await sendMail({
        to,
        subject: `Cenová nabídka – ${body?.clientName || "Tvoje Hnízdo"}`,
        html: `<p>Dobrý den ${body?.clientName || ""},</p><p>v příloze zasíláme cenovou nabídku. V případě dotazů jsme k dispozici.</p><p><strong>Tým Tvoje Hnízdo</strong></p>`,
        text: `Dobrý den ${body?.clientName || ""},\n\nv příloze zasíláme cenovou nabídku. V případě dotazů jsme k dispozici.\n\nTým Tvoje Hnízdo`,
        attachments: [{ filename: body?.filename || "cenova-nabidka.pdf", content: buffer }],
      });

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    default:
      return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
  }
}


