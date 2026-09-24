/**
 * Ubicación de una sesión en el formulario del panel: un único <select>
 * cuyo valor se traduce al par roomId / venueId de la BD.
 *
 *   "general"        → roomId = null, venueId = null   (fila general)
 *   "venue:<id>"     → roomId = null, venueId = <id>   (todas las salas del edificio)
 *   "room:<id>"      → roomId = <id>, venueId = null   (sala concreta; el edificio
 *                                                       se deduce de la sala, como
 *                                                       en la semilla)
 */
export const GENERAL_LOCATION = "general";

export interface LocationRef {
  roomId: string | null;
  venueId: string | null;
}

export function encodeLocation(roomId: string | null | undefined, venueId: string | null | undefined): string {
  if (roomId) return `room:${roomId}`;
  if (venueId) return `venue:${venueId}`;
  return GENERAL_LOCATION;
}

export function decodeLocation(value: string | null | undefined): LocationRef {
  const v = value ?? "";
  if (v.startsWith("room:")) return { roomId: v.slice(5) || null, venueId: null };
  if (v.startsWith("venue:")) return { roomId: null, venueId: v.slice(6) || null };
  return { roomId: null, venueId: null };
}

interface VenueLike {
  id: string;
  name: string;
}

interface RoomLike {
  id: string;
  venueId: string;
  name: string;
  active: boolean;
}

export interface LocationDescription {
  scope: "room" | "venue" | "global";
  label: string;
  detail: string | null;
}

/** Ubicación legible: «Fila general», «Todo el edificio: IUCE · Edificio Solís», «Aula 17A». */
export function describeLocation(
  s: LocationRef,
  venues: ReadonlyMap<string, VenueLike>,
  rooms: ReadonlyMap<string, RoomLike>,
): LocationDescription {
  if (s.roomId) {
    const room = rooms.get(s.roomId);
    if (!room) return { scope: "room", label: `Sala desconocida (${s.roomId})`, detail: null };
    const venue = venues.get(room.venueId);
    const detail = [venue?.name, room.active ? null : "sala inactiva"].filter(Boolean).join(" · ");
    return { scope: "room", label: room.name, detail: detail || null };
  }
  if (s.venueId) {
    const venue = venues.get(s.venueId);
    return {
      scope: "venue",
      label: `Todo el edificio: ${venue?.name ?? `desconocido (${s.venueId})`}`,
      detail: null,
    };
  }
  return { scope: "global", label: "Fila general", detail: null };
}

export interface LocationOption {
  value: string;
  label: string;
}

export interface LocationGroup {
  label: string;
  options: LocationOption[];
}

/**
 * Opciones del <select> de ubicación: fila general, «todo el edificio» por
 * cada edificio y las salas agrupadas por edificio (<optgroup>).
 */
export function buildLocationOptions(
  venues: (VenueLike & { order?: number })[],
  rooms: (RoomLike & { order?: number })[],
): { general: LocationOption; wholeVenues: LocationOption[]; groups: LocationGroup[] } {
  const byOrder = <T extends { order?: number; name: string }>(a: T, b: T) =>
    (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name, "es");
  const sortedVenues = [...venues].sort(byOrder);
  const knownVenues = new Set(sortedVenues.map((v) => v.id));

  const groups: LocationGroup[] = sortedVenues
    .map((venue) => ({
      label: venue.name,
      options: rooms
        .filter((r) => r.venueId === venue.id)
        .sort(byOrder)
        .map((r) => ({ value: `room:${r.id}`, label: r.active ? r.name : `${r.name} (inactiva)` })),
    }))
    .filter((g) => g.options.length > 0);

  const orphans = rooms.filter((r) => !knownVenues.has(r.venueId));
  if (orphans.length) {
    groups.push({
      label: "Sin edificio",
      options: orphans.sort(byOrder).map((r) => ({ value: `room:${r.id}`, label: r.name })),
    });
  }

  return {
    general: { value: GENERAL_LOCATION, label: "Fila general (todas las salas)" },
    wholeVenues: sortedVenues.map((v) => ({ value: `venue:${v.id}`, label: `Todo el edificio: ${v.name}` })),
    groups,
  };
}
