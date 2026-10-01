import type { L10n } from "@/lib/i18n";

/**
 * Fechas clave (documento de la organización, 01-10-2026). `date` en formato
 * AAAA-MM-DD; `null` = «Por anunciar». `home` marca las cinco que salen en la
 * portada; Comunicaciones las muestra todas, agrupadas.
 */
export type GrupoFecha = "resumenes" | "inscripcion" | "congreso" | "texto" | "actas";

export interface FechaClave {
  id: string;
  group: GrupoFecha;
  label: L10n;
  date: string | null;
  /** Fecha final, si es un intervalo (p. ej. el propio congreso) */
  until?: string | null;
  highlight?: boolean;
  home?: boolean;
}

export const GRUPOS_FECHA: { id: GrupoFecha; label: L10n }[] = [
  { id: "resumenes", label: { es: "Resúmenes", pt: "Resumos" } },
  { id: "inscripcion", label: { es: "Inscripción", pt: "Inscrição" } },
  { id: "congreso", label: { es: "Congreso", pt: "Congresso" } },
  { id: "texto", label: { es: "Texto completo", pt: "Texto completo" } },
  { id: "actas", label: { es: "Libros de actas", pt: "Livros de atas" } },
];

export const FECHAS: FechaClave[] = [
  {
    id: "resumenes-apertura",
    group: "resumenes",
    label: { es: "Apertura del envío de resúmenes", pt: "Abertura da submissão de resumos" },
    date: "2026-10-10",
    home: true,
  },
  {
    id: "resumenes-cierre",
    group: "resumenes",
    label: { es: "Cierre del envío de resúmenes", pt: "Fecho da submissão de resumos" },
    date: "2026-11-15",
    home: true,
  },
  {
    id: "resumenes-notificacion",
    group: "resumenes",
    label: { es: "Notificación de aceptación", pt: "Notificação de aceitação" },
    date: "2026-12-10",
    home: true,
  },
  {
    id: "resumenes-cambios",
    group: "resumenes",
    label: { es: "Envío de modificaciones, si se piden", pt: "Envio de alterações, se forem pedidas" },
    date: "2026-12-20",
  },
  {
    id: "resumenes-notificacion-2",
    group: "resumenes",
    label: { es: "Notificación de los resúmenes modificados", pt: "Notificação dos resumos alterados" },
    date: "2027-01-15",
  },
  {
    id: "inscripcion-reducida",
    group: "inscripcion",
    label: { es: "Fin de la tarifa reducida", pt: "Fim da tarifa reduzida" },
    date: "2027-01-20",
    home: true,
  },
  {
    id: "inscripcion-ordinaria",
    group: "inscripcion",
    label: { es: "Cierre de la inscripción (tarifa ordinaria)", pt: "Fecho das inscrições (tarifa normal)" },
    date: "2027-02-10",
  },
  {
    id: "congreso",
    group: "congreso",
    label: { es: "Celebración del congreso", pt: "Realização do congresso" },
    date: "2027-02-11",
    until: "2027-02-12",
    highlight: true,
    home: true,
  },
  {
    id: "texto-cierre",
    group: "texto",
    label: { es: "Cierre del envío de textos completos", pt: "Fecho da submissão de textos completos" },
    date: "2027-03-30",
  },
  {
    id: "texto-notificacion",
    group: "texto",
    label: { es: "Notificación de aceptación", pt: "Notificação de aceitação" },
    date: "2027-04-20",
  },
  {
    id: "texto-cambios",
    group: "texto",
    label: { es: "Envío de modificaciones, si se piden", pt: "Envio de alterações, se forem pedidas" },
    date: "2027-04-30",
  },
  {
    id: "texto-notificacion-2",
    group: "texto",
    label: { es: "Notificación de los textos modificados", pt: "Notificação dos textos alterados" },
    date: "2027-05-15",
  },
  {
    id: "actas-resumenes",
    group: "actas",
    label: { es: "Libro de actas de los resúmenes, en GREDOS", pt: "Livro de atas dos resumos, no GREDOS" },
    date: "2027-04-15",
  },
  {
    id: "actas-textos",
    group: "actas",
    label: { es: "Libro de actas de los textos completos, en GREDOS", pt: "Livro de atas dos textos completos, no GREDOS" },
    date: "2027-06-15",
  },
];

/** «11 de febrero de 2027» / «11 y 12 de febrero de 2027» (y en portugués). */
export function formatFecha(f: FechaClave, locale: "es" | "pt"): string | null {
  if (!f.date) return null;
  const loc = locale === "pt" ? "pt-PT" : "es-ES";
  const d1 = new Date(`${f.date}T12:00:00Z`);
  const full = (d: Date) =>
    new Intl.DateTimeFormat(loc, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
  if (!f.until) return full(d1);
  const d2 = new Date(`${f.until}T12:00:00Z`);
  if (d1.getUTCMonth() === d2.getUTCMonth()) {
    const month = new Intl.DateTimeFormat(loc, { month: "long", year: "numeric", timeZone: "UTC" }).format(d2);
    const y = locale === "pt" ? "e" : "y";
    return `${d1.getUTCDate()} ${y} ${d2.getUTCDate()} de ${month}`; // «11 y 12 de febrero de 2027»
  }
  return `${full(d1)} – ${full(d2)}`;
}
