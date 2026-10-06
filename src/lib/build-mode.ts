/**
 * La web se compila de dos maneras con el mismo código:
 *
 * - Servidor (por defecto): Node + PostgreSQL + panel /backstage, en Docker.
 *   Las páginas del programa se leen de la base de datos en cada visita.
 * - Estática (STATIC_EXPORT=1, `npm run build:static`): solo la web pública,
 *   generada al compilar, para GitHub Pages. Los ficheros *.server.* (panel,
 *   API, middleware) no existen en este modo y los *.static.* solo existen en él
 *   (ver `pageExtensions` en next.config.ts).
 */
export const STATIC_EXPORT = process.env.STATIC_EXPORT === "1";
