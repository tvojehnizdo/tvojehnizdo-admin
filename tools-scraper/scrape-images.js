const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { URL } = require("url");
const puppeteer = require("puppeteer");

const START_URL = "https://tvojehnizdo.webnode.cz/";
const DESKTOP = path.join(process.env.USERPROFILE || process.env.HOME, "Desktop");
const OUT_ROOT = path.join(DESKTOP, "TvojeHnizdo-Obrazky");

function detectNum(text) {
  const m = text.match(/(\d{2,3})\s?(?:m2|m)?/i);
  return m ? m[1] : null;
}
function detectCat(text) {
  const t = text.toLowerCase();
  if (/rekre|chata|chalup/.test(t)) return "Rekreacni-hnizda";
  if (/lux|premium|villa|reziden/.test(t)) return "Luxusni-hnizda";
  if (/mini|tiny|kompakt/.test(t)) return "Mini-hnizda";
  return "Rodinna-hnizda";
}
function toAbs(base, maybe) {
  try { return new URL(maybe, base).toString(); } catch { return null; }
}
function extFromUrl(u) {
  const clean = u.split("?")[0];
  const m = clean.match(/\.(jpg|jpeg|png|webp)$/i);
  return m ? m[0].toLowerCase() : ".jpg";
}

async function download(url, dest, referer) {
  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0", "Referer": referer || START_URL },
      timeout: 30000
    });
    await fs.outputFile(dest, res.data);
    return true;
  } catch {
    return false;
  }
}

async function collectDetailImages(page, detailUrl) {
  await page.goto(detailUrl, { waitUntil: "networkidle2", timeout: 60000 });

  // Vytáhnout IMG, data-src, srcset a background-image z DOMu
  const { imgs, bgUrls, cssHrefs } = await page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).toString(); } catch { return null; } };
    const set = new Set();

    // <img>
    document.querySelectorAll("img").forEach(img => {
      const add = (u) => { if (u) set.add(abs(u)); };
      add(img.getAttribute("src"));
      add(img.getAttribute("data-src"));
      const ss = img.getAttribute("srcset");
      if (ss) ss.split(",").forEach(part => add(part.trim().split(" ")[0]));
    });

    // background-image na všech prvcích
    const bgSet = new Set();
    document.querySelectorAll("*").forEach(el => {
      const s = getComputedStyle(el).getPropertyValue("background-image");
      if (s && s.includes("url(")) {
        const m = [...s.matchAll(/url\(["']?([^"')]+)["']?\)/g)];
        m.forEach(mm => bgSet.add(abs(mm[1])));
      }
    });

    // externí CSS
    const css = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => abs(l.href));

    return { imgs: Array.from(set), bgUrls: Array.from(bgSet), cssHrefs: css };
  });

  // Z externích CSS vytáhnout url(...)
  const cssUrls = new Set();
  for (const href of cssHrefs) {
    try {
      const res = await page.evaluate(async (u) => {
        try {
          const r = await fetch(u, { credentials: "omit" });
          if (!r.ok) return null;
          const t = await r.text();
          const arr = [];
          const re = /url\(["']?([^"')]+)["']?\)/gi;
          let m; while ((m = re.exec(t))) arr.push(new URL(m[1], u).toString());
          return arr;
        } catch { return null; }
      }, href);
      if (res) res.forEach(u => cssUrls.add(u));
    } catch { /* ignore */ }
  }

  // Sloučit a odfiltrovat jen obrázky
  const all = new Set([...(imgs||[]), ...(bgUrls||[]), ...cssUrls]);
  const onlyImages = [...all].filter(u => /\.(jpg|jpeg|png|webp)(\?|$)/i.test(u)).map(u => toAbs(detailUrl, u)).filter(Boolean);

  // Metainformace pro složky
  const html = await page.content();
  const pageTitle = await page.title();
  const houseNum = detectNum(detailUrl) || detectNum(html) || detectNum(pageTitle) || "xx";
  const cat = detectCat(detailUrl + " " + html + " " + pageTitle);

  return { images: [...new Set(onlyImages)], num: houseNum, cat };
}

(async () => {
  await fs.ensureDir(OUT_ROOT);
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0");

  // Crawler hloubka 2
  const host = new URL(START_URL).host;
  const queue = [{ url: START_URL, depth: 0 }];
  const seen = new Set();
  const detailUrls = new Set();

  while (queue.length) {
    const { url, depth } = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      if (/hnizdo-\d{2,3}m2\/?$/i.test(url)) detailUrls.add(url);

      if (depth < 2) {
        const links = await page.$$eval("a[href]", as => as.map(a => a.href));
        for (let href of links) {
          try {
            const u = new URL(href, url);
            if (u.host === host && !/\.(css|js|pdf|zip|doc|ico|svg)(\?|$)/i.test(u.pathname) && !seen.has(u.toString())) {
              queue.push({ url: u.toString(), depth: depth + 1 });
            }
          } catch {}
        }
      }
    } catch {}
  }

  console.log("Detaily nalezené:", detailUrls.size);
  if (!detailUrls.size) {
    console.log("Nenalezeny žádné stránky hnizdo-XXm2. Zkontroluj, že Webnode má publikované detaily.");
    await browser.close();
    return;
  }

  // Pro každý detail stáhni obrázky
  for (const detail of detailUrls) {
    try {
      const { images, num, cat } = await collectDetailImages(page, detail);
      const houseDir = path.join(OUT_ROOT, cat, `Hnízdo ${num}`);
      await fs.ensureDir(houseDir);

      let i = 1;
      for (const u of images) {
        const ext = extFromUrl(u);
        const file = i === 1 ? `hnizdo-${num}${ext}` : `hnizdo-${num}-${i}${ext}`;
        const dest = path.join(houseDir, file);
        const ok = await download(u, dest, detail);
        if (ok) console.log("Uloženo:", dest);
        i++;
      }
    } catch (e) {
      console.log("Chyba detailu:", detail);
    }
  }

  await browser.close();
  console.log("HOTOVO ", OUT_ROOT);
})();
