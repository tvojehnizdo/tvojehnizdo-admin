import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(_req: NextApiRequest, res: NextApiResponse){
  try{
    const SHEET_ID = process.env.POPTAVKY_SHEETS_ID || process.env.LOG_SHEETS_ID;
    const SVC_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if(!SHEET_ID || !SVC_JSON) return res.status(501).json({error:"Missing POPTAVKY_SHEETS_ID or GOOGLE_SERVICE_ACCOUNT_JSON"});
    const { google } = await import("googleapis");
    const creds = JSON.parse(SVC_JSON);
    const auth = new google.auth.JWT(creds.client_email, undefined, creds.private_key, ["https://www.googleapis.com/auth/spreadsheets"]);
    const sheets = google.sheets({version:"v4", auth});
    const range = "poptavky!A:E";
    const get = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
    const rows = (get.data.values || []);
    const out = [];
    for (let i=1;i<rows.length;i++){ // skip header
      const r = rows[i] || [];
      out.push({ idx: i+1, datum: r[0]||"", jmeno: r[1]||"", email: r[2]||"", poznamka: r[3]||"", konfigurace: r[4]||"" });
    }
    return res.status(200).json({ ok:true, rows: out });
  }catch(e:any){ return res.status(500).json({ error: e?.message || "fetch error" }); }
}
