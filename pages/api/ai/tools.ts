import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const computePrice = {
  name: "computePrice",
  description: "Odhad ceny domu.",
  inputSchema: z.object({
    area: z.number().positive(),
    standard: z.enum(["hruba","k_dokonceni","na_klic"]),
    extras: z.array(z.string()).optional(),
  }),
  async call(input:any) {
    const base = 30500; const factor = input.standard==="hruba"?0.7:input.standard==="k_dokonceni"?0.9:1.0;
    return { priceCZK: Math.round(input.area*base*factor) };
  }
};
const tools = [computePrice];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { name, input } = req.body || {};
    const tool = (tools as any[]).find(t=>t.name===name);
    if (!tool) return res.status(404).json({ error: "Unknown tool" });
    const parsed = (tool as any).inputSchema.safeParse(input);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const result = await (tool as any).call(parsed.data);
    return res.status(200).json({ ok:true, name, result });
  } catch (e:any) {
    return res.status(500).json({ error: e?.message || "tools error" });
  }
}
