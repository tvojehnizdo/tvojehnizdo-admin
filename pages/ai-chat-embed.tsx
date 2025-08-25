import React from "react";
export default function AIChatEmbed(){
  const [messages,setMessages]=React.useState([{role:"assistant",content:"Dobrý den! Jak vám můžeme pomoci?"} as any]);
  const [input,setInput]=React.useState(""); const [loading,setLoading]=React.useState(false);
  async function send(){
    const t=input.trim(); if(!t||loading) return; setInput(""); setMessages(m=>[...m,{role:"user",content:t}]); setLoading(true);
    try{
      const r=await fetch("/api/ai/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"system",content:"Jsi asistent Tvoje Hnízdo."}, ...messages.map(m=>({role:m.role,content:m.content})), {role:"user",content:t}]})});
      const data=await r.json(); setMessages(m=>[...m,{role:"assistant",content:data?.content||"⚠️ Nepodařilo se získat odpověď."}]);
    }catch{ setMessages(m=>[...m,{role:"assistant",content:"⚠️ Chyba připojení."}]); } finally{ setLoading(false); }
  }
  return (<div style={{height:"100%",display:"flex",flexDirection:"column",fontFamily:"system-ui"}}>
    <div style={{padding:10,borderBottom:"1px solid #eee",fontWeight:600}}>Tvoje Hnízdo • AI</div>
    <div style={{flex:1,overflowY:"auto",padding:10}}>
      {messages.map((m,i)=>(<div key={i} style={{textAlign:m.role==="user"?"right":"left",margin:"6px 0"}}>
        <span style={{display:"inline-block",padding:"8px 10px",borderRadius:12,background:m.role==="user"?"#e8f0fe":"#f3f4f6"}}>{m.content}</span>
      </div>))}
      {loading && <div>…</div>}
    </div>
    <div style={{display:"flex",gap:8,padding:10,borderTop:"1px solid #eee"}}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
        placeholder="Zeptejte se…" style={{flex:1,padding:"10px",border:"1px solid #ddd",borderRadius:10}}/>
      <button onClick={send} disabled={loading} style={{padding:"10px 14px",borderRadius:10,background:"#000",color:"#fff",opacity:loading?0.4:1}}>Odeslat</button>
    </div>
  </div>);
}
