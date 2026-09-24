import type { SessionTypeKey } from "@/lib/session-types";

/**
 * Formas serializadas (JSON) que viajan de las páginas del panel (servidor)
 * a sus componentes cliente, y que devuelve la API /api/admin/**.
 * Las fechas van como cadenas ISO.
 */

export type Role = "ADMIN" | "EDITOR";
export type ProgrammeStatus = "provisional" | "definitivo";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administración",
  EDITOR: "Edición",
};

export interface AdminUserInfo {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

// ─── Espacios y días ──────────────────────────────────────────────────

export interface VenueOption {
  id: string;
  name: string;
  namePt: string | null;
  short: string | null;
  order: number;
}

export interface RoomOption {
  id: string;
  venueId: string;
  name: string;
  active: boolean;
  order: number;
}

export interface DayOption {
  key: string;
  labelEs: string;
  labelPt: string;
  order: number;
}

export interface VenueData extends VenueOption {
  subtitle: string | null;
  subtitlePt: string | null;
  address: string | null;
  /** Sesiones con ámbito «todo el edificio». */
  sessionsCount: number;
  rooms: RoomData[];
}

export interface RoomData extends RoomOption {
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
  sessionsCount: number;
}

export interface DayRow extends DayOption {
  sessionsCount: number;
}

// ─── Sesiones ─────────────────────────────────────────────────────────

export interface TalkData {
  id: string;
  order: number;
  title: string;
  authors: string | null;
  presenter: string | null;
  abstract: string | null;
  axis: string | null;
}

export interface SessionData {
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
  published: boolean;
  order: number;
  talks: TalkData[];
  createdAt: string;
  updatedAt: string;
}

/** Fila del listado del programa. */
export interface SessionRow {
  id: string;
  day: string;
  start: string;
  end: string;
  type: SessionTypeKey;
  title: string;
  titlePt: string | null;
  subtitle: string | null;
  roomId: string | null;
  venueId: string | null;
  location: string | null;
  published: boolean;
  cancelled: boolean;
  speakersCount: number;
  talksCount: number;
  /** Ubicación legible: "Fila general", "Todo el edificio: …", "Aula 17A". */
  locationLabel: string;
  /** Detalle secundario (edificio de la sala, lugar externo…). */
  locationDetail: string | null;
  /** Texto normalizado para el buscador. */
  search: string;
}

// ─── Cuentas ──────────────────────────────────────────────────────────

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
