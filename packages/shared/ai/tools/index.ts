import { z } from "zod";
export const tools = [
  {
    name: "computePrice",
    description: "Odhad ceny domu.",
    inputSchema: z.object({
      area: z.number().positive(),
      standard: z.enum(["hruba","k_dokonceni","na_klic"]),
      extras: z.array(z.string()).optional(),
    }),
    async call(input:any) {
      const base = 30500;
      const factor = input.standard==="hruba"?0.7:input.standard==="k_dokonceni"?0.9:1.0;
      return { priceCZK: Math.round(input.area*base*factor) };
    }
  }
];
