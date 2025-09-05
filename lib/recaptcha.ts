import "cross-fetch/polyfill";
export async function verifyRecaptcha(token?: string, remoteIp?: string){
  const secret=process.env.RECAPTCHA_SECRET;
  if(!secret) return { ok:true, skipped:true };
  if(!token) return { ok:false, error:"Missing reCAPTCHA token" };
  const p=new URLSearchParams(); p.append("secret",secret); p.append("response",token); if(remoteIp) p.append("remoteip",remoteIp);
  const r=await fetch("https://www.google.com/recaptcha/api/siteverify",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:p.toString()});
  const d:any=await r.json(); if(!d.success) return { ok:false, error:"reCAPTCHA verification failed", d };
  if(typeof d.score==="number" && d.score < (Number(process.env.RECAPTCHA_MIN_SCORE||"0.5"))) return { ok:false, error:"Low reCAPTCHA score", score:d.score };
  return { ok:true, data:d };
}
