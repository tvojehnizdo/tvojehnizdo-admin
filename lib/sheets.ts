import { google } from "googleapis";

function getJwt() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !key) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL/GOOGLE_PRIVATE_KEY");
  key = key.replace(/\\n/g, "\n"); // převod \n z env
  return new google.auth.JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
}

export async function appendSheetRow(values: any[], opts: { spreadsheetId?: string; range?: string } = {}) {
  const spreadsheetId = opts.spreadsheetId ?? process.env.SHEETS_SPREADSHEET_ID;
  const range = opts.range ?? process.env.SHEETS_RANGE ?? "A:Z";
  if (!spreadsheetId) throw new Error("Missing SHEETS_SPREADSHEET_ID");
  const auth = await getJwt();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId, range, valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
  return { ok: true, updates: res.data.updates };
}
