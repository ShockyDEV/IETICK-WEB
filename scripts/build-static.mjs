/**
 * Versión estática de la web para GitHub Pages (`npm run build:static`).
 *
 *   1. `next build` con STATIC_EXPORT=1: solo la web pública, ya generada.
 *      Las páginas leen el programa de la base de datos al compilar, así que
 *      hace falta DATABASE_URL con el programa cargado.
 *   2. Reordena out/ para que GitHub Pages sirva las mismas direcciones que el
 *      modo servidor: el español sin prefijo (/programa) y el portugués en /pt.
 *   3. 404.html, CNAME (si se define SITE_DOMAIN) y .nojekyll.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const rel = (p) => path.relative(OUT, p).replaceAll("\\", "/");

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

// ─── 1. Compilación ─────────────────────────────────────────────────────
rmSync(OUT, { recursive: true, force: true });
const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
const build = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: { ...process.env, STATIC_EXPORT: "1" },
});
if (build.status !== 0) process.exit(build.status ?? 1);
if (!existsSync(OUT)) fail("next build no ha generado out/");
// Los tipos de rutas de este modo (sin panel) confundirían a `npm run
// typecheck` en local; el servidor de desarrollo los vuelve a generar.
rmSync(path.join(process.cwd(), process.env.NEXT_DIST_DIR || ".next", "types"), { recursive: true, force: true });

// ─── 2. Español en la raíz ──────────────────────────────────────────────
/** Mueve el contenido de src a dest sin pisar nada (un choque es un error). */
function moveInto(src, dest) {
  for (const name of readdirSync(src)) {
    const from = path.join(src, name);
    const to = path.join(dest, name);
    if (existsSync(to)) {
      if (!statSync(from).isDirectory() || !statSync(to).isDirectory()) {
        fail(`Al pasar el español a la raíz, ${rel(to)} ya existe`);
      }
      moveInto(from, to);
    } else {
      renameSync(from, to);
    }
  }
  rmSync(src, { recursive: true, force: true });
}

for (const ext of ["html", "txt"]) {
  const from = path.join(OUT, `es.${ext}`);
  if (!existsSync(from)) fail(`Falta out/es.${ext} (la portada en español)`);
  const to = path.join(OUT, `index.${ext}`);
  if (existsSync(to)) fail(`out/index.${ext} ya existe`);
  renameSync(from, to);
}
if (existsSync(path.join(OUT, "es"))) moveInto(path.join(OUT, "es"), OUT);

// /pt y /pt/ llevan a la misma portada (por si GitHub Pages añade la barra
// al ver que también existe la carpeta pt/).
for (const ext of ["html", "txt"]) {
  copyFileSync(path.join(OUT, `pt.${ext}`), path.join(OUT, "pt", `index.${ext}`));
}

// ─── 3. 404, dominio y Jekyll ───────────────────────────────────────────
const notFound = path.join(OUT, "pagina-no-encontrada.html");
if (!existsSync(notFound)) fail("Falta la página 404 (pagina-no-encontrada)");
copyFileSync(notFound, path.join(OUT, "404.html"));
for (const f of ["pagina-no-encontrada.html", "pagina-no-encontrada.txt", "pt/pagina-no-encontrada.html", "pt/pagina-no-encontrada.txt"]) {
  rmSync(path.join(OUT, f), { force: true });
}

const domain = (process.env.SITE_DOMAIN || "").trim();
if (domain) writeFileSync(path.join(OUT, "CNAME"), `${domain}\n`);
writeFileSync(path.join(OUT, ".nojekyll"), "");

// ─── Comprobación final ─────────────────────────────────────────────────
const required = [
  "index.html",
  "programa.html",
  "comites.html",
  "pt.html",
  "pt/programa.html",
  "404.html",
  "sitemap.xml",
  "robots.txt",
  "og-image.png",
];
const missing = required.filter((f) => !existsSync(path.join(OUT, f)));
if (missing.length) fail(`Faltan en out/: ${missing.join(", ")}`);

const html = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "_next") walk(p);
    } else if (name.endsWith(".html")) {
      html.push(rel(p));
    }
  }
})(OUT);
console.log(`\n✓ Versión estática lista en out/ (${html.length} páginas${domain ? `, dominio ${domain}` : ""})`);
