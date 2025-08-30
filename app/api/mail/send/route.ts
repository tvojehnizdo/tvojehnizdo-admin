import { corsJson, preflight } from "../../../../lib/cors";
import { sendMail } from "../../../../lib/mailer";
import { logToSheets } from "../../../../lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(){ return corsJson({}, { status:204 }); }

export async function POST(req: Request) {
  const pre = preflight(req); if (pre) return pre;
  try {
    const body = await req.json().catch(() => null) as any;
    const { to, subject, html, text } = body ?? {};
    if (!to || !subject || (!html && !text)) {
      return corsJson({ ok:false, error:"Missing fields: to, subject, (html|text)" }, { status:400 });
    }
    const r = await sendMail({ to, subject, html, text });
    await logToSheets("mail.send.ok", { to, subject }, r);
    return corsJson(r, { status:200 });
  } catch (e:any) {
    await logToSheets("mail.send.err", {}, { error:String(e?.message||e) }).catch(()=>{});
    return corsJson({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}
