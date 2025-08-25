import React from "react";
export default function AINavrh(){
  const [inquiry,setInquiry]=React.useState("");
  const [out,setOut]=React.useState<{subject:string,body:string}|null>(null);
  const [sending,setSending]=React.useState(false);
  async function gen(){
    setSending(true); setOut(null);
    const r = await fetch("/api/ai/reply",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({inquiry})});
    const data = await r.json(); setOut({subject:data.subject||"", body:data.body||""}); setSending(false);
  }
  async function logToSheets(){
    try{
      await fetch("/api/logs/sheets",{method:"POST",headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ range:"A:Z", values:[[new Date().toISOString(),"ai-navrh", out?.subject||"", out?.body||"", inquiry]] })});
      alert("Zalogováno.");
    }catch{ alert("Log selhal (zkontroluj .env)");}
  }
  return (<div style={{maxWidth:900,margin:"40px auto",padding:20,fontFamily:"system-ui"}}>
    <h1>AI návrh odpovědi</h1>
    <textarea value={inquiry} onChange={e=>setInquiry(e.target.value)} placeholder="Vlož text poptávky…"
      style={{width:"100%",height:200, padding:10}}/>
    <div style={{marginTop:10, display:"flex", gap:8}}>
      <button onClick={gen} disabled={sending} style={{padding:"8px 12px"}}>Vygenerovat</button>
      {out && <button onClick={logToSheets} style={{padding:"8px 12px"}}>Log do Sheets</button>}
    </div>
    {out && <div style={{marginTop:20}}>
      <div><b>Předmět:</b> {out.subject}</div>
      <div style={{whiteSpace:"pre-wrap", marginTop:10}}><b>Tělo e-mailu:</b>{"\n"}{out.body}</div>
    </div>}
  </div>);
}
