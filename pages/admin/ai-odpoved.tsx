import React from "react";

export default function AIOdpoved(){
  const [email,setEmail]=React.useState("");
  const [inquiry,setInquiry]=React.useState("");
  const [subject,setSubject]=React.useState("");
  const [body,setBody]=React.useState("");
  const [loading,setLoading]=React.useState(false);
  const [statusMsg,setStatusMsg]=React.useState<string>("");

  // klasifikace
  const [cls,setCls]=React.useState<{status:string,reason:string}|null>(null);

  async function generate(){
    setLoading(true); setStatusMsg(""); setCls(null);
    try{
      const r=await fetch("/api/ai/reply",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({inquiry})});
      const data=await r.json();
      setSubject(data.subject||"");
      setBody((data.body||data.content||"").trim());
    }catch(e:any){ setStatusMsg("⚠️ Chyba AI: "+(e?.message||"")); }
    finally{ setLoading(false); }
  }

  async function classify(){
    setLoading(true); setStatusMsg("");
    try{
      const r=await fetch("/api/ai/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({inquiry})});
      const data=await r.json();
      setCls({ status: data.status||"Nová", reason: data.reason||"" });
    }catch(e:any){ setStatusMsg("⚠️ Chyba klasifikace: "+(e?.message||"")); }
    finally{ setLoading(false); }
  }

  async function send(){
    setLoading(true); setStatusMsg("");
    try{
      const r=await fetch("/api/email/send",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ to: email, subject, html: (body||"").replace(/\n/g,"<br/>") })});
      const data=await r.json();
      setStatusMsg(data?.ok ? "✅ E-mail odeslán." : ("⚠️ Odeslání selhalo: "+(data?.error||"")));
    }catch(e:any){ setStatusMsg("⚠️ Odeslání selhalo: "+(e?.message||"")); }
    finally{ setLoading(false); }
  }

  async function logSheets(){
    setLoading(true); setStatusMsg("");
    try{
      const r=await fetch("/api/logs/sheets",{method:"POST",headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ range:"A:Z", values:[[new Date().toISOString(),"ai-odpoved", email, subject, body, inquiry, cls?.status||"", cls?.reason||""]] })});
      const data=await r.json();
      setStatusMsg(data?.ok ? "📝 Zalogováno do Sheets." : ("⚠️ Log selhal: "+(data?.error||"")));
    }catch(e:any){ setStatusMsg("⚠️ Log selhal: "+(e?.message||"")); }
    finally{ setLoading(false); }
  }

  const copy = (t:string)=>{ navigator.clipboard.writeText(t); setStatusMsg("📋 Zkopírováno."); };

  return (
    <div style={{maxWidth:980,margin:"30px auto",padding:20,fontFamily:"system-ui"}}>
      <h1>AI návrh odpovědi</h1>
      <div style={{display:"grid",gap:10}}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail zákazníka"
               style={{padding:10,border:"1px solid #ddd",borderRadius:8}}/>
        <textarea value={inquiry} onChange={e=>setInquiry(e.target.value)} placeholder="Vlož text poptávky…"
                  style={{height:160,padding:10,border:"1px solid #ddd",borderRadius:8}}/>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={generate} disabled={loading} style={{padding:"8px 12px"}}>Vygenerovat</button>
          <button onClick={classify} disabled={loading||!inquiry} style={{padding:"8px 12px"}}>Klasifikovat stav</button>
          <button onClick={()=>copy(inquiry)} style={{padding:"8px 12px"}}>Kopírovat poptávku</button>
        </div>

        {cls && <div style={{padding:10,border:"1px solid #eee",borderRadius:8,background:"#fafafa"}}>
          <b>Stav:</b> {cls.status} <br/>
          <b>Odůvodnění:</b> {cls.reason}
        </div>}

        <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Předmět"
               style={{padding:10,border:"1px solid #ddd",borderRadius:8}}/>
        <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Tělo e-mailu"
                  style={{height:220,padding:10,border:"1px solid #ddd",borderRadius:8,whiteSpace:"pre-wrap"}}/>

        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={()=>copy(subject)} style={{padding:"8px 12px"}}>Kopírovat předmět</button>
          <button onClick={()=>copy(body)} style={{padding:"8px 12px"}}>Kopírovat tělo</button>
          <button onClick={send} disabled={loading||!email||!subject||!body} style={{padding:"8px 12px"}}>Odeslat e-mail</button>
          <button onClick={logSheets} style={{padding:"8px 12px"}}>Log do Sheets</button>
        </div>

        {statusMsg && <div style={{marginTop:6,color:"#444"}}>{statusMsg}</div>}
      </div>
    </div>
  );
}
