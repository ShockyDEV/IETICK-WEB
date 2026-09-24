import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

/**
 * 1) Panel: /backstage/** y /api/admin/** exigen sesión (JWT, edge-safe).
 * 2) Idiomas: el español va sin prefijo y se REESCRIBE internamente a
 *    /es/…; el portugués vive en /pt/…; /es/… redirige a la URL canónica.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname, search } = req.nextUrl;

  // ─── Panel de administración ──────────────────────────────────────
  if (pathname.startsWith("/backstage") || pathname.startsWith("/api/admin")) {
    if (pathname.startsWith("/backstage/acceso")) return NextResponse.next();
    if (!req.auth) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      const url = new URL("/backstage/acceso", req.url);
      url.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // ─── Idiomas ─────────────────────────────────────────────────────
  if (pathname === "/pt" || pathname.startsWith("/pt/")) return NextResponse.next();
  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  const url = req.nextUrl.clone();
  url.pathname = `/es${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
});

export const config = {
  // Todo menos los internos de Next y cualquier ruta con punto (ficheros:
  // imágenes, favicon, sitemap.xml, robots.txt…). Patrón de next-intl.
  matcher: ["/((?!_next|.*\\..*).*)"],
};
