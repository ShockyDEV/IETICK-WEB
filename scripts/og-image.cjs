/**
 * Genera public/og-image.png (1200×630) a partir del hero de la portada.
 *
 *   node scripts/og-image.cjs [http://localhost:3027]
 *
 * Necesita el servidor en marcha. Usa puppeteer-core + Chrome local (el mismo
 * montaje que los PDF de ICED26: puppeteer-core vive en ICED26+/assets).
 */
const path = require("node:path");
module.paths.push("C:/Users/USUARIO/Desktop/IUCE/ICED26+/assets/node_modules");
const puppeteer = require("puppeteer-core");

const BASE = process.argv[2] || "http://localhost:3027";
const OUT = path.join(__dirname, "..", "public", "og-image.png");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 120000 });
  await page.addStyleTag({
    content: `
      header, [role="timer"], nextjs-portal { display: none !important; }
      section:first-of-type a { display: none !important; }
      section:first-of-type > div.contenedor { min-height: 630px !important; padding-top: 44px !important; padding-bottom: 40px !important; justify-content: center !important; }
      section:first-of-type > div.contenedor img { width: 21rem !important; margin-top: 1.25rem !important; }
    `,
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await browser.close();
  console.log("OK", OUT);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
