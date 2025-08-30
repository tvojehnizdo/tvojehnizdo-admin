import { appendSheetRow } from "./sheets";

function sleep(ms:number){ return new Promise(r=>setTimeout(r,ms)); }

/** Zapíše řádek do Google Sheets s 3-krokovým retry (exponenciální backoff). */
export async function logToSheets(kind:string, payload:any, extra:Record<string,any> = {}) {
  const ts = new Date().toISOString();
  const flat = JSON.stringify(payload);
  const info = JSON.stringify(extra);
  let lastErr: any = null;
  for (let i=0;i<3;i++){
    try{
      await appendSheetRow([ts, kind, flat, info]);
      return { ok:true };
    }catch(e:any){
      lastErr = e?.message || e;
      await sleep(300 * Math.pow(2,i));
    }
  }
  throw new Error("logToSheets failed: "+String(lastErr));
}
