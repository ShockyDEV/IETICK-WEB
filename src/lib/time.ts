/**
 * Utilidades de hora. TODO el programa se expresa en hora local de Madrid
 * (Europe/Madrid): en febrero es CET, UTC+1. Portugal peninsular va una hora
 * por detrás (WET), por eso el programa ofrece la conversión a la hora local
 * del visitante cuando no coincide con la de Madrid.
 *
 * A diferencia del programa de ICED26 (que fijaba +02:00 porque se celebró en
 * junio), el desfase se calcula con Intl para cualquier fecha.
 */
export const CONGRESS_TZ = "Europe/Madrid";

export interface ZonedParts {
  dayKey: string; // "2027-02-11"
  minutes: number; // minutos desde las 00:00
  label: string; // "09:30"
}

/** Fecha/hora de un instante en la zona indicada (Madrid por defecto). */
export function zonedParts(date: Date, timeZone: string = CONGRESS_TZ): ZonedParts {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]));
  const hour = Number(p.hour) % 24; // algunos motores devuelven "24" a medianoche
  return {
    dayKey: `${p.year}-${p.month}-${p.day}`,
    minutes: hour * 60 + Number(p.minute),
    label: `${String(hour).padStart(2, "0")}:${p.minute}`,
  };
}

/** Desfase (minutos) de una zona respecto a UTC en un instante dado. */
export function tzOffsetMinutes(date: Date, timeZone: string): number {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour) % 24,
    Number(p.minute),
    Number(p.second),
  );
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** Instante real de un "día + HH:MM" expresado en hora de Madrid. */
export function madridDate(dayKey: string, hhmm: string): Date {
  const [y, m, d] = dayKey.split("-").map(Number);
  const [H, M] = hhmm.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, H, M));
  const off = tzOffsetMinutes(guess, CONGRESS_TZ);
  return new Date(guess.getTime() - off * 60000);
}

export function hmToMinutes(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export type SessionState = "past" | "live" | "future";

/** Estado de una sesión respecto a un instante (en hora de Madrid). */
export function sessionState(
  s: { day: string; start: string; end: string },
  now: Date,
): SessionState {
  const { dayKey, minutes } = zonedParts(now);
  if (s.day !== dayKey) return s.day < dayKey ? "past" : "future";
  if (minutes < hmToMinutes(s.start)) return "future";
  if (minutes >= hmToMinutes(s.end)) return "past";
  return "live";
}

/** Hora de Madrid convertida a la zona del visitante ("09:00"). */
export function formatInZone(dayKey: string, hhmm: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(madridDate(dayKey, hhmm));
}

/** Diferencia en minutos entre la zona del visitante y Madrid (−60 = Lisboa en invierno). */
export function offsetVsMadrid(dayKey: string, hhmm: string, timeZone: string): number {
  const d = madridDate(dayKey, hhmm);
  return tzOffsetMinutes(d, timeZone) - tzOffsetMinutes(d, CONGRESS_TZ);
}

/** "−1 h", "+5 h 30" */
export function formatOffset(minutes: number): string {
  if (!minutes) return "±0";
  const sign = minutes > 0 ? "+" : "−";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m ? `${sign}${h} h ${String(m).padStart(2, "0")}` : `${sign}${h} h`;
}
