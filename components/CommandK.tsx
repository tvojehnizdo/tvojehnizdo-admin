import React from "react";
export default function CommandK(){
  React.useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      const k=e.key.toLowerCase();
      if((e.ctrlKey||e.metaKey)&&k==="k"){
        e.preventDefault();
        const q=prompt("Hledat / příkaz:");
        if(!q) return;
        fetch("/api/ai/intent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q})})
          .then(r=>r.json()).then(res=>{
            const i=(res?.intent||"JINE").toUpperCase();
            if(i==="KONFIGURATOR") location.href="/konfigurator";
            else if(i==="CENY") location.href="/cenik";
            else if(i==="KONTAKT") location.href="/kontakt";
            else if(i==="MAGAZIN") location.href="/magazin";
            else location.href="/hledat?q="+encodeURIComponent(q);
          }).catch(()=>{});
      }
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[]);
  return null;
}
