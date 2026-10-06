import type { NextConfig } from "next";

/**
 * Dos modos con el mismo código (ver src/lib/build-mode.ts):
 * - servidor (por defecto): Node + PostgreSQL + panel, imagen Docker standalone;
 * - estático (STATIC_EXPORT=1, `npm run build:static`): solo la web pública,
 *   ya generada, para GitHub Pages.
 */
const STATIC_EXPORT = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: STATIC_EXPORT ? "export" : "standalone",
  // Los ficheros *.server.* (panel, API, middleware) solo cuentan en modo
  // servidor y los *.static.* (404.html) solo en el estático.
  pageExtensions: STATIC_EXPORT
    ? ["static.tsx", "static.ts", "tsx", "ts", "jsx", "js"]
    : ["server.tsx", "server.ts", "tsx", "ts", "jsx", "js"],
  // Permite compilar a otra carpeta (NEXT_DIST_DIR=.next-build) sin pisar
  // la `.next` del servidor de desarrollo que esté en marcha.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  // Sin servidor no hay optimizador de imágenes: se sirven tal cual (los
  // ficheros de public/ ya están a su tamaño).
  images: STATIC_EXPORT
    ? { unoptimized: true }
    : {
        deviceSizes: [640, 750, 828, 1080, 1200, 1600],
        imageSizes: [32, 48, 64, 96, 128, 256, 384],
        formats: ["image/avif", "image/webp"],
      },
  // Tipos y lint ya se comprueban en CI con el modo servidor (npm run
  // typecheck, eslint); aquí, además, chocarían los tipos de rutas que Next
  // genera para cada modo. En GitHub Pages las cabeceras las pone GitHub.
  ...(STATIC_EXPORT
    ? { typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true } }
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "SAMEORIGIN" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
