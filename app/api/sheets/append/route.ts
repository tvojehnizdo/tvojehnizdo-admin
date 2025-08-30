import { NextResponse } from "next/server";
import { appendSheetRow } from "../../../lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as any;
    const values = body?.values;
    if (!Array.isArray(values)) {
      return NextResponse.json({ ok:false, error:"Body must include 'values' array" }, { status: 400 });
    }
    const spreadsheetId = body?.spreadsheetId; // optional override
    const range = body?.range;                 // optional override
    const r = await appendSheetRow(values, { spreadsheetId, range });
    return NextResponse.json(r, { status: 200 });
  } catch (e:any) {
    console.error("SHEETS ERROR:", e?.message || e);
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}
