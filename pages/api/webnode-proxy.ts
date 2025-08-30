import type { NextApiRequest, NextApiResponse } from "next"
import { fetchWebnode } from "../../lib/webnode"
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = String(req.query.url || "")
    if (!/^https?:\/\//i.test(url)) return res.status(400).send("Missing or invalid 'url'")
    const html = await fetchWebnode(url)
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400")
    res.status(200).send(html)
  } catch (e:any) { res.status(500).send(e?.message || "Proxy error") }
}

