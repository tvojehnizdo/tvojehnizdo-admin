import type { NextApiRequest, NextApiResponse } from "next";
import { appendSheetRow } from "../../../lib/sheets";
import { logToSheets } from "../../../lib/log";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS"){ res.setHeader("Access-Control-Allow-Origin","*"); res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS"); res.setHeader("Access-Control-Allow-Headers","Content-Type, Authorization"); return res.status(204).end(); }
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method Not Allowed" });
  try{
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const values = body.values;
    const spreadsheetId = body.spreadsheetId; const range = body.range;
    if (!Array.isArray(values)) return res.status(400).json({ ok:false, error:"Body must include 'values' array" });
    const r = await appendSheetRow(values, { spreadsheetId, range });
    await logToSheets("sheets.append.ok", { values, spreadsheetId, range }, r);
    res.setHeader("Access-Control-Allow-Origin","*");
    return res.status(200).json(r);
  }catch(e:any){
    await logToSheets("sheets.append.err", {}, { error:String(e?.message||e) }).catch(()=>{});
    res.setHeader("Access-Control-Allow-Origin","*");
    return res.status(500).json({ ok:false, error:String(e?.message||e) });
  }
}
export const config = { api: { bodyParser: true } };
