import React from "react";
import { marketingEnabled } from "../../lib/flags";
import { loadPosts } from "../../lib/marketing";

export default function MarketingIndex(){
  if(!marketingEnabled) return <div style={{display:"none"}}/>;
  const posts = loadPosts().filter(p=>p.status==="published");
  return (
    <div style={{maxWidth:900,margin:"40px auto",fontFamily:"system-ui"}}>
      <h1>Marketing – články</h1>
      {!posts.length && <p>Zatím nic publikováno.</p>}
      <ul>{posts.map(p=> <li key={p.slug}><a href={`/marketing/${p.slug}`}>{p.title}</a></li>)}</ul>
    </div>
  );
}
