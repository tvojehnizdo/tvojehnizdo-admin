"use client";
import React from "react";

type Props = {
  email?: string;
  getInquiry: () => string;   // sem si předáš text poptávky (z řádku/Detailu)
};

export default function AiReplyButton({ email="", getInquiry }: Props){
  const [open,setOpen]=React.useState(false);
  const [subject,setSubject]=React.useState("");
  const [body,setBody]=React.useState("");
  const [to,setTo]=React.useState(email||"");
  const [loading,setLoading]=React.useState(false);
  const [status,setStatus]=React.useState("");

  async function generate(){
    setLoading(true); setStatus("");
    try{
      const r=await fetch("/api/ai/reply",{method:"POST",headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ inquiry: getInquiry() })});
      const data=await r.json();
      setSubject(data.subject||"");
      setBody((data.body||data.content||"").trim());
    }catch(e:any){ setStatus("⚠️ Chyba AI: "+(e?.message||"")); }
    finally{ setLoading(false); }
  }

  async function send(){
    setLoading(true); setStatus("");
    try{
      const r=await fetch("/api/email/send",{method:"POST",headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ to, subject, html: (body||"").replace(/\n/g,"<br/>") })});
      const data=await r.json();
      setStatus(data?.ok ? "✅ E-mail odeslán." : ("⚠️ Odeslání selhalo: "+(data?.error||"")));
    }catch(e:any){ setStatus("⚠️ Odeslání selhalo: "+(e?.message||"")); }
    finally{ setLoading(false); }
  }

  async function logSheets(){
    setLoading(true); setStatus("");
    try{
      const r=await fetch("/api/logs/sheets",{method:"POST",headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ range:"A:Z", values:[[new Date().toISOString(),"ai-odpoved", to, subject, body, getInquiry() ]] })});
      const data=await r.json();
      setStatus(data?.ok ? "📝 Zalogováno do Sheets." : ("⚠️ Log selhal: "+(data?.error||"")));
    }catch(e:any){ setStatus("⚠️ Log selhal: "+(e?.message||"")); }
    finally{ setLoading(false); }
  }

  function copy(t:string){ navigator.clipboard.writeText(t); setStatus("📋 Zkopírováno."); }

  return (
    <>
      <button onClick={()=>setOpen(true)} style={{padding:"6px 10px",border:"1px solid #ddd",borderRadius:8, background:"#fff"}}>
        AI odpověď
      </button>

      {open && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:9999}} onClick={()=>setOpen(false)}>
          <div onClick={e=>e.stopPropagation()}
               style={{position:"absolute",inset:"10% 50% auto 10%",right:"10%",maxWidth:900,margin:"auto",
                       background:"#fff",borderRadius:12,padding:16,boxShadow:"0 10px 30px rgba(0,0,0,.25)"}}>
            <h3 style={{margin:"0 0 10px"}}>AI návrh odpovědi</h3>
            <div style={{display:"grid",gap:8}}>
              <input value={to} onChange={e=>setTo(e.target.value)} placeholder="E-mail zákazníka"
                     style={{padding:8,border:"1px solid #ddd",borderRadius:8}}/>
              <div style={{display:"flex",gap:8}}>
                <button onClick={generate} disabled={loading} style={{padding:"8px 12px"}}>Vygenerovat</button>
                <button onClick={()=>copy(getInquiry())} style={{padding:"8px 12px"}}>Kopírovat poptávku</button>
              </div>
              <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Předmět"
                     style={{padding:8,border:"1px solid #ddd",borderRadius:8}}/>
              <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Tělo e-mailu"
                        style={{height:200,padding:8,border:"1px solid #ddd",borderRadius:8,whiteSpace:"pre-wrap"}}/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>copy(subject)} style={{padding:"8px 12px"}}>Kopírovat předmět</button>
                <button onClick={()=>copy(body)} style={{padding:"8px 12px"}}>Kopírovat tělo</button>
                <button onClick={send} disabled={loading||!to||!subject||!body} style={{padding:"8px 12px"}}>Odeslat e-mail</button>
                <button onClick={logSheets} style={{padding:"8px 12px"}}>Log do Sheets</button>
                <button onClick={()=>setOpen(false)} style={{padding:"8px 12px"}}>Zavřít</button>
              </div>
              {status && <div style={{marginTop:4,color:"#444"}}>{status}</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
