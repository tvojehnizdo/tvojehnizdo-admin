import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY!, baseURL: process.env.OPENAI_API_BASE || "https://api.openai.com/v1" });
const system = `Urči záměr: FAQ, KONTAKT, CENY, KONFIGURATOR, NABIDKA, SCHUZKA, MAGAZIN, JINE. Vrať JSON { "intent": string, "confidence": number }`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { query } = req.body || {};
    const r = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: system }, { role: "user", content: String(query || "") }],
    });
    const text = r.choices?.[0]?.message?.content || "{}";
    try { return res.status(200).json(JSON.parse(text)); }
    catch { return res.status(200).json({ intent: "JINE", confidence: 0.2 }); }
  } catch (e:any) {
    return res.status(500).json({ error: e?.message || "intent error" });
  }
}
