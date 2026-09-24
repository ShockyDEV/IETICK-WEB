/**
 * Ayudantes de formato del panel (válidos en servidor y cliente).
 */
import { TIME_PATTERN, timeToMinutes } from "@/lib/programme-validate";

export const MADRID_TZ = "Europe/Madrid";

/** "1 h 30 min", "45 min", "2 h"; null si las horas no son válidas o fin ≤ inicio. */
export function durationLabel(start: string, end: string): string | null {
  if (!TIME_PATTERN.test(start) || !TIME_PATTERN.test(end)) return null;
  const minutes = timeToMinutes(end) - timeToMinutes(start);
  if (minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Minúsculas y sin tildes, para buscar sin distinguir "Solís" de "solis". */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Fecha y hora en hora de Madrid: "24/9/26, 12:04". */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: MADRID_TZ,
  }).format(date);
}

/** ¿"AAAA-MM-DD" es una fecha real del calendario? */
export function isRealDate(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Fecha corta de un día del congreso: "jue, 11 feb 2027". */
export function formatDayKey(key: string): string {
  if (!isRealDate(key)) return key;
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${key}T12:00:00Z`));
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Etiquetas propuestas para un día, con el formato de la semilla:
 * "Jueves 11 de febrero" / "Quinta-feira, 11 de fevereiro".
 */
export function suggestDayLabels(key: string): { es: string; pt: string } | null {
  if (!isRealDate(key)) return null;
  const date = new Date(`${key}T12:00:00Z`);
  const opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" };
  const es = new Intl.DateTimeFormat("es-ES", opts).format(date).replace(",", "");
  const pt = new Intl.DateTimeFormat("pt-PT", opts).format(date);
  return { es: capitalize(es), pt: capitalize(pt) };
}

/** Líneas no vacías de un texto «uno por línea». */
export function textLines(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** "1 sesión" / "3 sesiones". */
export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
