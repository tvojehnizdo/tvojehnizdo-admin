export type LeadLog = {
  timeISO: string;
  type: string;
  email?: string;
  name?: string;
  payload?: string;
};

/** No-op log do Sheets (zapne se až po doplnění klíčů) */
export const appendLeadLog = async (_row: LeadLog): Promise<void> => {
  if (!process.env.GSHEETS_PRIVATE_KEY || !process.env.GSHEETS_CLIENT_EMAIL || !process.env.GSHEETS_SHEET_ID) return;
  // TODO: implementace googleapis sheets.values.append
};

/**
 * Flexibilní helper pro zápis řádku:
 * 1) appendSheetRow(values, { spreadsheetId, range })
 * 2) appendSheetRow(spreadsheetId, range, values)
 * 3) appendSheetRow({ spreadsheetId, range, values })
 * V tuto chvíli NO-OP bez GSheets klíčů.
 */
export const appendSheetRow = async (...args: any[]): Promise<void> => {
  if (!process.env.GSHEETS_PRIVATE_KEY || !process.env.GSHEETS_CLIENT_EMAIL || !process.env.GSHEETS_SHEET_ID) return;

  let spreadsheetId = "", range = "";
  let values: (string | number | null)[] = [];

  if (Array.isArray(args[0]) && typeof args[1] === "object") {
    // 1) (values, { spreadsheetId, range })
    values = args[0];
    spreadsheetId = args[1]?.spreadsheetId || "";
    range = args[1]?.range || "";
  } else if (typeof args[0] === "string" && typeof args[1] === "string" && Array.isArray(args[2])) {
    // 2) (spreadsheetId, range, values)
    spreadsheetId = args[0];
    range = args[1];
    values = args[2];
  } else if (typeof args[0] === "object" && Array.isArray(args[0]?.values)) {
    // 3) ({ spreadsheetId, range, values })
    spreadsheetId = args[0]?.spreadsheetId || "";
    range = args[0]?.range || "";
    values = args[0]?.values;
  } else {
    return; // nevalidní vstup – tiše ukonči (bez pádu)
  }

  // TODO: reálný zápis přes Google Sheets API (values.append)
  // console.log("appendSheetRow()", { spreadsheetId, range, values });
};

export default appendLeadLog;
