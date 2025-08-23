import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID!;
const sheetName = process.env.SHEETS_SHEET_EMAILS || "odeslane_emaily";

function getAuth() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON missing");
  const creds = JSON.parse(json);
  // Nová doporučená forma: JWT přes options objekt
  const jwt = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES,
  });
  return jwt;
}

export async function logEmailRow(row: {
  datetime: string;
  to: string;
  subject: string;
  status: "OK" | "ERROR";
  messageId?: string;
  error?: string;
}) {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const range = `${sheetName}!A:F`;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: {
      values: [[row.datetime, row.to, row.subject, row.status, row.messageId || "", row.error || ""]],
    },
  });
}
