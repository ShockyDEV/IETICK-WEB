/**
 * Subcarpeta en la que vive la web cuando GitHub Pages la sirve sin dominio
 * propio (shockydev.github.io/IETICK-WEB → "/IETICK-WEB"). Vacía con dominio
 * propio y en modo servidor. La fija next.config.ts a partir de PAGES_BASE_PATH.
 *
 * Next la añade solo a <Link>, a sus propios ficheros y a las imágenes (con
 * el cargador de la versión estática); para los <a> nativos (descargas de
 * public/, conmutador de idioma), los iconos y el manifiesto hay que pasar la
 * ruta por withBase().
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBase(path: string): string {
  return path.startsWith("/") ? `${BASE_PATH}${path}` : path;
}
