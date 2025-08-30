import type { NextApiRequest, NextApiResponse } from "next";
import { appendSheetRow } from "../../../lib/sheets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method Not Allowed" });
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const values = body.values;
    const spreadsheetId = body.spreadsheetId; // volitelné (přepíše env)
    const range = body.range;                 // volitelné (přepíše env)

    if (!Array.isArray(values)) return res.status(400).json({ ok:false, error:"Body must include 'values' array" });

    const r = await appendSheetRow(values, { spreadsheetId, range });
    return res.status(200).json(r);
  } catch (e:any) {
    console.error("SHEETS ERROR:", e?.message || e);
    return res.status(500).json({ ok:false, error:String(e?.message || e) });
  }
}
