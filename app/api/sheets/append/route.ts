import { corsJson, preflight } from "../../../../lib/cors";
import { appendSheetRow } from "../../../../lib/sheets";
import { logToSheets } from "../../../../lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(){ return corsJson({}, { status:204 }); }

export async function POST(req: Request) {
  const pre = preflight(req); if (pre) return pre;
  try {
    const body = await req.json().catch(() => null) as any;
    const values = body?.values;
    const spreadsheetId = body?.spreadsheetId; // optional override
    const range = body?.range;                 // optional override
    if (!Array.isArray(values)) return corsJson({ ok:false, error:"Body must include 'values' array" }, { status:400 });

    const res = await appendSheetRow(values, { spreadsheetId, range });
    await logToSheets("sheets.append.ok", { values, spreadsheetId, range }, { res });
    return corsJson(res, { status:200 });
  } catch (e:any) {
    await logToSheets("sheets.append.err", {}, { error:String(e?.message||e) }).catch(()=>{});
    return corsJson({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}

