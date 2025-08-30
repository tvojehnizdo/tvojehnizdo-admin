import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: doplnit mailer/sheets po stabilizaci aliasů (použijeme relativní cesty)
  res.status(200).json({ ok: true });
}

// Pozn.: Bez TS const assertion (as const), ať SWC nepadá
export const config = { api: { bodyParser: true } };
