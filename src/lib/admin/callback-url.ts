/**
 * Destino tras iniciar sesión. Solo se aceptan rutas del panel (evita las
 * redirecciones abiertas): cualquier otra cosa vuelve al Resumen.
 */
export const PANEL_HOME = "/backstage";

export function safeCallbackUrl(value: unknown): string {
  if (typeof value !== "string") return PANEL_HOME;
  let path = value.trim();
  if (!path) return PANEL_HOME;

  // Auth.js puede devolver URLs absolutas: nos quedamos con la ruta.
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) {
    try {
      const url = new URL(path);
      path = url.pathname + url.search + url.hash;
    } catch {
      return PANEL_HOME;
    }
  }

  if (path.startsWith("//") || path.includes("\\")) return PANEL_HOME;
  const isPanel = path === PANEL_HOME || /^\/backstage[/?#]/.test(path);
  if (!isPanel || path.startsWith("/backstage/acceso")) return PANEL_HOME;
  return path;
}
