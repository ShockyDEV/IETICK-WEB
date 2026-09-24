import type { L10n } from "@/lib/i18n";

/**
 * Fechas clave del congreso. Se muestran en la portada y en Comunicaciones.
 * `date` en formato AAAA-MM-DD; `null` = «Por anunciar». Basta con rellenar
 * aquí la fecha para que aparezca en toda la web.
 */
export interface FechaClave {
  id: string;
  label: L10n;
  date: string | null;
  /** Fecha final, si es un intervalo (p. ej. el propio congreso) */
  until?: string | null;
  highlight?: boolean;
}

export const FECHAS: FechaClave[] = [
  {
    id: "envio-apertura",
    label: { es: "Apertura del envío de comunicaciones", pt: "Abertura da submissão de comunicações" },
    date: null,
  },
  {
    id: "envio-cierre",
    label: { es: "Cierre del envío de comunicaciones", pt: "Fecho da submissão de comunicações" },
    date: null,
  },
  {
    id: "notificacion",
    label: { es: "Notificación de aceptación", pt: "Notificação de aceitação" },
    date: null,
  },
  {
    id: "inscripcion-reducida",
    label: { es: "Inscripción con tarifa reducida", pt: "Inscrição com tarifa reduzida" },
    date: null,
  },
  {
    id: "congreso",
    label: { es: "Celebración del congreso", pt: "Realização do congresso" },
    date: "2027-02-11",
    until: "2027-02-12",
    highlight: true,
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
