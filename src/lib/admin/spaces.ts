import "server-only";
import type { Room, Venue } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/admin/errors";
import { slugify, uniqueSlug } from "@/lib/admin/slug";
import { plural } from "@/lib/admin/format";
import type { RoomInput, VenueInput } from "@/lib/admin/schemas";
import type { DayOption, RoomData, RoomOption, VenueData, VenueOption } from "@/lib/admin/types";

/**
 * Servicio de espacios: edificios (Venue) y salas (Room).
 *
 * El `id` es un slug estable que se genera del nombre al crear y no se
 * edita después (lo usan las sesiones y la web pública). No se borra una
 * sala con sesiones (se propone desactivarla) ni un edificio con salas o
 * sesiones: el borrado en cascada del esquema convertiría esas sesiones en
 * filas generales sin avisar.
 */

type RoomWithCount = Room & { _count: { sessions: number } };

function toRoomData(r: RoomWithCount): RoomData {
  return {
    id: r.id,
    venueId: r.venueId,
    name: r.name,
    namePt: r.namePt,
    code: r.code,
    capacity: r.capacity,
    floor: r.floor,
    floorPt: r.floorPt,
    description: r.description,
    descriptionPt: r.descriptionPt,
    equipment: r.equipment,
    imageUrl: r.imageUrl,
    accessible: r.accessible,
    order: r.order,
    active: r.active,
    sessionsCount: r._count.sessions,
  };
}

function toVenueData(v: Venue & { _count: { sessions: number }; rooms: RoomWithCount[] }): VenueData {
  return {
    id: v.id,
    name: v.name,
    namePt: v.namePt,
    short: v.short,
    subtitle: v.subtitle,
    subtitlePt: v.subtitlePt,
    address: v.address,
    order: v.order,
    sessionsCount: v._count.sessions,
    rooms: v.rooms.map(toRoomData),
  };
}

const ROOM_INCLUDE = { _count: { select: { sessions: true } } } as const;

// ─── Lectura ──────────────────────────────────────────────────────────

export async function listVenuesWithRooms(): Promise<VenueData[]> {
  const venues = await prisma.venue.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { sessions: true } },
      rooms: { orderBy: [{ order: "asc" }, { name: "asc" }], include: ROOM_INCLUDE },
    },
  });
  return venues.map(toVenueData);
}

/** Opciones para los selectores del formulario de sesión. */
export async function getProgrammeOptions(): Promise<{
  days: DayOption[];
  venues: VenueOption[];
  rooms: RoomOption[];
}> {
  const [days, venues, rooms] = await Promise.all([
    prisma.day.findMany({ orderBy: [{ order: "asc" }, { key: "asc" }] }),
    prisma.venue.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, namePt: true, short: true, order: true },
    }),
    prisma.room.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, venueId: true, name: true, active: true, order: true },
    }),
  ]);
  return {
    days: days.map(({ key, labelEs, labelPt, order }) => ({ key, labelEs, labelPt, order })),
    venues,
    rooms,
  };
}

// ─── Edificios ────────────────────────────────────────────────────────

async function freeVenueId(name: string): Promise<string> {
  const base = slugify(name) || "edificio";
  const taken = await prisma.venue.findMany({ where: { id: { startsWith: base } }, select: { id: true } });
  return uniqueSlug(base, taken.map((t) => t.id), "edificio");
}

export async function createVenue(input: VenueInput): Promise<VenueData> {
  const id = await freeVenueId(input.name);
  const venue = await prisma.venue.create({
    data: { id, ...input },
    include: { _count: { select: { sessions: true } }, rooms: { include: ROOM_INCLUDE } },
  });
  return toVenueData(venue);
}

export async function updateVenue(id: string, input: VenueInput): Promise<VenueData> {
  const exists = await prisma.venue.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new HttpError(404, "El edificio no existe (puede que se haya borrado).");
  const venue = await prisma.venue.update({
    where: { id },
    data: input,
    include: {
      _count: { select: { sessions: true } },
      rooms: { orderBy: [{ order: "asc" }, { name: "asc" }], include: ROOM_INCLUDE },
    },
  });
  return toVenueData(venue);
}

export async function deleteVenue(id: string): Promise<void> {
  const venue = await prisma.venue.findUnique({
    where: { id },
    select: { name: true, _count: { select: { rooms: true, sessions: true } } },
  });
  if (!venue) throw new HttpError(404, "El edificio no existe (puede que ya se haya borrado).");
  const { rooms, sessions } = venue._count;
  if (rooms > 0 || sessions > 0) {
    const parts = [
      rooms > 0 ? plural(rooms, "sala", "salas") : null,
      sessions > 0 ? plural(sessions, "sesión de todo el edificio", "sesiones de todo el edificio") : null,
    ].filter(Boolean);
    throw new HttpError(
      409,
      `No se puede borrar «${venue.name}»: tiene ${parts.join(" y ")}. Mueve o borra primero esas salas y sesiones.`,
    );
  }
  await prisma.venue.delete({ where: { id } });
}

// ─── Salas ────────────────────────────────────────────────────────────

async function assertVenue(venueId: string): Promise<void> {
  const venue = await prisma.venue.findUnique({ where: { id: venueId }, select: { id: true } });
  if (!venue) {
    throw new HttpError(400, "El edificio elegido no existe.", [
      { path: "venueId", message: "Ese edificio no existe." },
    ]);
  }
}

async function freeRoomId(name: string): Promise<string> {
  const base = slugify(name) || "sala";
  const taken = await prisma.room.findMany({ where: { id: { startsWith: base } }, select: { id: true } });
  return uniqueSlug(base, taken.map((t) => t.id), "sala");
}

export async function createRoom(input: RoomInput): Promise<RoomData> {
  await assertVenue(input.venueId);
  const id = await freeRoomId(input.name);
  const room = await prisma.room.create({ data: { id, ...input }, include: ROOM_INCLUDE });
  return toRoomData(room);
}

export async function updateRoom(id: string, input: RoomInput): Promise<RoomData> {
  const exists = await prisma.room.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new HttpError(404, "La sala no existe (puede que se haya borrado).");
  await assertVenue(input.venueId);
  const room = await prisma.room.update({ where: { id }, data: input, include: ROOM_INCLUDE });
  return toRoomData(room);
}

export async function setRoomActive(id: string, active: boolean): Promise<RoomData> {
  const room = await prisma.room.update({ where: { id }, data: { active }, include: ROOM_INCLUDE });
  return toRoomData(room);
}

export async function deleteRoom(id: string): Promise<void> {
  const room = await prisma.room.findUnique({
    where: { id },
    select: { name: true, active: true, _count: { select: { sessions: true } } },
  });
  if (!room) throw new HttpError(404, "La sala no existe (puede que ya se haya borrado).");
  const n = room._count.sessions;
  if (n > 0) {
    throw new HttpError(
      409,
      `No se puede borrar «${room.name}»: tiene ${plural(n, "sesión asignada", "sesiones asignadas")}. ` +
        (room.active ? "Desactívala para ocultarla de la web pública." : "Ya está desactivada: mueve antes sus sesiones si quieres borrarla."),
    );
  }
  await prisma.room.delete({ where: { id } });
}
