import type { NextApiRequest, NextApiResponse } from "next";
import { getOpenAI, models } from "../../../packages/shared/ai/client";
import { marketingEnabled } from "../../../lib/flags";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const secret = req.headers["x-marketing-secret"] as string || req.query.secret as string || "";
  if (!secret || secret !== process.env.MARKETING_API_SECRET) return res.status(403).json({error:"forbidden"});
  if (!process.env.OPENAI_API_KEY) return res.status(501).json({error:"missing OPENAI key"});
  // API povolíme i když marketingEnabled=false (příprava obsahu v zákulisí)
  try{
    const { topic="", mode="outline" } = req.body||{};
    const client = getOpenAI();
    const sys = mode==="outline"
      ? "Jsi senior editor. Vrať OUTLINE 6–8 bodů, FAQ a CTA (česky)."
      : "Jsi editor. Napiš DRAFT 1500–2000 slov podle OUTLINE, česky, věcně, bez klišé.";
    const r = await client.chat.completions.create({
      model: models.default, temperature: 0.4,
      messages: [{role:"system",content:sys}, {role:"user",content:String(topic)}]
    });
    return res.status(200).json({ ok:true, text: r.choices?.[0]?.message?.content||"" });
  }catch(e:any){ return res.status(500).json({error:e?.message||"ai error"}); }
}
