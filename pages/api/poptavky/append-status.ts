import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== "POST") return res.status(405).end();
  try{
    const SHEET_ID = process.env.POPTAVKY_SHEETS_ID || process.env.LOG_SHEETS_ID;
    const SVC_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if(!SHEET_ID || !SVC_JSON) return res.status(501).json({error:"Missing POPTAVKY_SHEETS_ID or GOOGLE_SERVICE_ACCOUNT_JSON"});
    const { google } = await import("googleapis");
    const creds = JSON.parse(SVC_JSON);
    const auth = new google.auth.JWT(creds.client_email, undefined, creds.private_key, ["https://www.googleapis.com/auth/spreadsheets"]);
    const sheets = google.sheets({version:"v4", auth});
    const values = (req.body?.values || []) as any[][];
    if(!Array.isArray(values) || !values.length) return res.status(400).json({error:"No values"});
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "stav_zakazky!A:Z",
      valueInputOption: "RAW",
      requestBody: { values }
    });
    return res.status(200).json({ ok:true, count: values.length });
  }catch(e:any){ return res.status(500).json({ error: e?.message || "append error" }); }
}
