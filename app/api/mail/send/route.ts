import { NextResponse } from "next/server";
import { sendMail } from "../../../lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as any;
    const { to, subject, html, text } = body ?? {};
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ ok:false, error:"Missing fields: to, subject, (html|text)" }, { status: 400 });
    }
    const r = await sendMail({ to, subject, html, text });
    return NextResponse.json(r, { status: 200 });
  } catch (e:any) {
    console.error("MAIL ERROR:", e?.message || e);
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}
