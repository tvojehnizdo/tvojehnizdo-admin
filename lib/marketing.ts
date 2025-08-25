import fs from "node:fs";
import path from "node:path";

export type Post = { title:string; slug:string; date:string; status:"draft"|"published"; content:string };
export function loadPosts(): Post[] {
  const dir = path.join(process.cwd(), "marketing", "content");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f=>f.endsWith(".md")).map(f=>{
    const p = path.join(dir,f); const raw=fs.readFileSync(p,"utf8");
    const m = /^---\s*([\s\S]*?)---\s*/.exec(raw); const body = raw.replace(/^---[\s\S]*?---\s*/,"");
    const meta: any = {};
    if(m){ m[1].split(/\r?\n/).filter(Boolean).forEach(line=>{
      const i=line.indexOf(":"); if(i>0){ meta[line.slice(0,i).trim()]=line.slice(i+1).trim().replace(/^"|"$/g,""); }
    }) }
    return { title: meta.title||"Bez názvu", slug: meta.slug||f.replace(/\.md$/,""), date: meta.date||"", status: (meta.status||"draft") as any, content: body.trim() };
  });
}
