import type { NextApiRequest, NextApiResponse } from "next";
import { getOpenAI, models } from "../../../packages/shared/ai/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method !== "POST") return res.status(405).end();
  try{
    const { inquiry = "" } = req.body || {};
    const system = `Jsi CRM asistent Tvoje Hnízdo. Posuď stav poptávky.
Vrať čistý JSON: {"status":"Nová"|"Řešeno"|"Hotovo","reason":string}. Nic jiného.`;

    const openai = getOpenAI();
    const r = await openai.chat.completions.create({
      model: models.default,
      messages: [
        { role:"system", content: system },
        { role:"user", content: String(inquiry) }
      ],
      temperature: 0
    });
    const text = r.choices?.[0]?.message?.content || "{}";
    try { return res.status(200).json(JSON.parse(text)); }
    catch { return res.status(200).json({ status: "Nová", reason: "" }); }
  } catch (e:any) {
    return res.status(500).json({ error: e?.message || "status error" });
  }
}
