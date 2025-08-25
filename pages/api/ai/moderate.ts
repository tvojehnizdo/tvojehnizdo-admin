import type { NextApiRequest, NextApiResponse } from "next";
import { maskPII } from "../../../packages/shared/ai/guards/pii";
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { text } = req.body || {};
  const clean = maskPII(String(text ?? ""));
  return res.status(200).json({ ok: true, clean });
}
