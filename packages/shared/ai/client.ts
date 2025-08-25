import OpenAI from "openai";
export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const baseURL = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
  return new OpenAI({ apiKey, baseURL });
}
export const models = { default: process.env.OPENAI_MODEL || "gpt-4o-mini" };
