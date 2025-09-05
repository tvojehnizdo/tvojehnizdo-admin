import type { NextApiRequest, NextApiResponse } from "next";
import { sendMail } from "../../../lib/mailer";
import { logToSheets } from "../../../lib/log";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS"){ res.setHeader("Access-Control-Allow-Origin","*"); res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS"); res.setHeader("Access-Control-Allow-Headers","Content-Type, Authorization"); return res.status(204).end(); }
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method Not Allowed" });
  try{
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { to, subject, html, text } = body || {};
    if (!to || !subject || (!html && !text)) return res.status(400).json({ ok:false, error:"Missing fields: to, subject, (html|text)" });
    const r = await sendMail({ to, subject, html, text });
    await logToSheets("mail.send.ok", { to, subject }, r);
    res.setHeader("Access-Control-Allow-Origin","*");
    return res.status(200).json(r);
  }catch(e:any){
    await logToSheets("mail.send.err", {}, { error:String(e?.message||e) }).catch(()=>{});
    res.setHeader("Access-Control-Allow-Origin","*");
    return res.status(500).json({ ok:false, error:String(e?.message||e) });
  }
}
export const config = { api: { bodyParser: true } };
