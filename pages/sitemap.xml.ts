import type { NextApiRequest, NextApiResponse } from "next";
import { marketingEnabled } from "../lib/flags";
import { loadPosts } from "../lib/marketing";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const urls = [`<url><loc>${base}</loc><changefreq>weekly</changefreq></url>`];
  if (marketingEnabled) {
    const posts = loadPosts().filter(p=>p.status==="published");
    for (const p of posts) urls.push(`<url><loc>${base}/marketing/${p.slug}</loc></url>`);
  }
  res.setHeader("Content-Type","application/xml");
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`);
}
