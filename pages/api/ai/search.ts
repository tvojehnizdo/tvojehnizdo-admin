import type { NextApiRequest, NextApiResponse } from "next";
import fs from "node:fs";
import path from "node:path";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { q } = req.body || {};
    const dir = path.join(process.cwd(), "docs/knowledge");
    const hits:any[] = [];
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir)) {
        if (f.endsWith(".md")) {
          const content = fs.readFileSync(path.join(dir, f), "utf8");
          const hay = (f.replace(/\.md$/,"") + " " + content).toLowerCase();
          if (String(q||"").toLowerCase().split(/\s+/).every(w => hay.includes(w))) {
            hits.push({ id: f, title: f.replace(/\.md$/,""), content });
          }
        }
      }
    }
    res.status(200).json({ hits: hits.slice(0,5) });
  } catch (e:any) {
    res.status(500).json({ error: e?.message || "search error" });
  }
}




