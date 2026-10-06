import type { SessionTypeKey } from "@/lib/session-types";
import type { Locale } from "@/lib/i18n";

/**
 * Capa de datos del programa. Serializa la BD a un objeto plano que viaja
 * al componente cliente de la parrilla (equivalente a `window.ICED26_DATA`
 * del programa de ICED26). Este módulo solo tiene tipos y utilidades que
 * también usa el navegador; la lectura de la base de datos está en
 * programme-data.ts.
 */

export type ProgrammeStatus = "provisional" | "definitivo";

export interface ProgrammeVenue {
  id: string;
  name: string;
  namePt: string | null;
  short: string | null;
  subtitle: string | null;
  subtitlePt: string | null;
  address: string | null;
  order: number;
}

export interface ProgrammeRoom {
  id: string;
  venueId: string;
  name: string;
  namePt: string | null;
  code: string | null;
  capacity: number | null;
  floor: string | null;
  floorPt: string | null;
  description: string | null;
  descriptionPt: string | null;
  equipment: string[];
  imageUrl: string | null;
  accessible: boolean;
  order: number;
}

export interface ProgrammeTalk {
  id: string;
  order: number;
  title: string;
  authors: string | null;
  presenter: string | null;
  abstract: string | null;
  axis: string | null;
}

export interface ProgrammeSession {
  id: string;
  day: string;
  start: string;
  end: string;
  type: SessionTypeKey;
  title: string;
  titlePt: string | null;
  subtitle: string | null;
  subtitlePt: string | null;
  description: string | null;
  descriptionPt: string | null;
  speakers: string | null;
  chair: string | null;
  roomId: string | null;
  venueId: string | null;
  location: string | null;
  locationPt: string | null;
  streamUrl: string | null;
  cancelled: boolean;
  talks: ProgrammeTalk[];
}

export interface ProgrammeDay {
  key: string;
  labelEs: string;
  labelPt: string;
}

export interface ProgrammeData {
  status: ProgrammeStatus;
  days: ProgrammeDay[];
  venues: ProgrammeVenue[];
  rooms: ProgrammeRoom[];
  sessions: ProgrammeSession[];
  updatedAt: string | null;
}

/** Ámbito de una sesión: sala concreta, todo un edificio o fila general. */
export type SessionScope = "room" | "venue" | "global";

export function sessionScope(s: Pick<ProgrammeSession, "roomId" | "venueId">): SessionScope {
  if (s.roomId) return "room";
  if (s.venueId) return "venue";
  return "global";
}

export function tr(es: string, pt: string | null | undefined, locale: Locale): string {
  return locale === "pt" && pt ? pt : es;
}

export function sessionTitle(s: ProgrammeSession, locale: Locale): string {
  return tr(s.title, s.titlePt, locale);
}

export function roomName(r: ProgrammeRoom, locale: Locale): string {
  return tr(r.name, r.namePt, locale);
}

export function venueName(v: ProgrammeVenue, locale: Locale): string {
  return tr(v.name, v.namePt, locale);
}

export function dayLabel(d: ProgrammeDay, locale: Locale): string {
  return locale === "pt" ? d.labelPt : d.labelEs;
}

/** Lista de ponentes (uno por línea en el panel). */
export function speakerList(s: Pick<ProgrammeSession, "speakers">): string[] {
  return (s.speakers || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}
