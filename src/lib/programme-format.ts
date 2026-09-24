import type { Locale } from "@/lib/i18n";
import {
  sessionScope,
  tr,
  type ProgrammeData,
  type ProgrammeRoom,
  type ProgrammeSession,
  type ProgrammeVenue,
} from "@/lib/programme";
import { SESSION_TYPE_META } from "@/lib/session-types";

/** Ayudantes de formato del programa, válidos en servidor y en cliente. */

export function typeLabel(s: Pick<ProgrammeSession, "type">, locale: Locale): string {
  return SESSION_TYPE_META[s.type].label[locale];
}

export function typeColor(s: Pick<ProgrammeSession, "type">): string {
  return SESSION_TYPE_META[s.type].color;
}

export interface LocationInfo {
  label: string;
  room?: ProgrammeRoom;
  venue?: ProgrammeVenue;
  scope: "room" | "venue" | "global";
}

/** Dónde ocurre una sesión, en texto legible. */
export function sessionLocation(
  s: ProgrammeSession,
  data: Pick<ProgrammeData, "rooms" | "venues">,
  locale: Locale,
): LocationInfo | null {
  const scope = sessionScope(s);
  if (scope === "room") {
    const room = data.rooms.find((r) => r.id === s.roomId);
    if (!room) return null;
    const venue = data.venues.find((v) => v.id === room.venueId);
    return { label: tr(room.name, room.namePt, locale), room, venue, scope };
  }
  if (scope === "venue") {
    const venue = data.venues.find((v) => v.id === s.venueId);
    if (!venue) return null;
    const short = venue.short || tr(venue.name, venue.namePt, locale);
    return {
      label: locale === "pt" ? `Salas do ${short}` : `Aulas del ${short}`,
      venue,
      scope,
    };
  }
  if (s.location) return { label: tr(s.location, s.locationPt, locale), scope };
  return null;
}

/** "Jue 11" / "Qui 11" a partir de "2027-02-11". */
export function shortDay(dayKey: string, locale: Locale): string {
  const d = new Date(`${dayKey}T12:00:00Z`);
  const wd = new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "es-ES", { weekday: "short", timeZone: "UTC" })
    .format(d)
    .replace(".", "");
  return `${wd.charAt(0).toUpperCase()}${wd.slice(1)} ${d.getUTCDate()}`;
}

/** "11 feb" / "11 fev". */
export function dayMonth(dayKey: string, locale: Locale): string {
  const d = new Date(`${dayKey}T12:00:00Z`);
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "es-ES", { day: "numeric", month: "short", timeZone: "UTC" })
    .format(d)
    .replace(".", "");
}
