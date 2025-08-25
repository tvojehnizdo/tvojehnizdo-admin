import type { NextApiRequest, NextApiResponse } from "next";
import { getOpenAI, models } from "../../../packages/shared/ai/client";
import { brandSystem } from "../../../packages/shared/ai/prompts/brand";
import { maskPII } from "../../../packages/shared/ai/guards/pii";

function originAllowed(req: NextApiRequest) {
  const allowed = (process.env.AI_ALLOWED_ORIGINS || "").split(",").filter(Boolean);
  const origin = (req.headers["origin"] as string) || "";
  if (!allowed.length) return true;
  return allowed.includes(origin);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  if (!originAllowed(req)) return res.status(403).send("Origin not allowed");
  try {
    const { messages = [], temperature = 0.4, max_tokens = 900 } = req.body || {};
    const safe = messages.map((m:any)=>({ role: m.role, content: maskPII(String(m.content||"")) }));
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: models.default,
      messages: [{ role: "system", content: brandSystem }, ...safe],
      temperature, max_tokens,
    });
    const content = completion.choices?.[0]?.message?.content || "";
    return res.status(200).json({ content });
  } catch (e:any) {
    return res.status(500).json({ error: e?.message || "AI error" });
  }
}
