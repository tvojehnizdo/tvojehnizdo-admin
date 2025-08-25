import type { NextApiRequest, NextApiResponse } from "next";
import { getOpenAI, models } from "../../../packages/shared/ai/client";
import { brandSystem } from "../../../packages/shared/ai/prompts/brand";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== "POST") return res.status(405).end();
  try{
    const { inquiry="" } = req.body || {};
    const openai = getOpenAI();
    const r = await openai.chat.completions.create({
      model: models.default,
      messages: [
        { role:"system", content: brandSystem + "\nVrať JSON: {\"subject\": string, \"body\": string}." },
        { role:"user", content: "Poptávka:\n"+String(inquiry) }
      ],
      temperature: 0.4,
      max_tokens: 700
    });
    const text = r.choices?.[0]?.message?.content || "{}";
    try { return res.status(200).json(JSON.parse(text)); }
    catch { return res.status(200).json({ subject:"", body:text }); }
  }catch(e:any){ return res.status(500).json({ error: e?.message || "AI error" }); }
}
