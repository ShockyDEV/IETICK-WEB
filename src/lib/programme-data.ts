import "server-only";
import { connection } from "next/server";
import { STATIC_EXPORT } from "@/lib/build-mode";
import { prisma } from "@/lib/prisma";
import type { SessionTypeKey } from "@/lib/session-types";
import type { ProgrammeData } from "@/lib/programme";

/** Programa público: solo sesiones publicadas y salas activas. */
export async function getProgramme(): Promise<ProgrammeData> {
  const [days, venues, rooms, sessions, status] = await Promise.all([
    prisma.day.findMany({ orderBy: [{ order: "asc" }, { key: "asc" }] }),
    prisma.venue.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.room.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.session.findMany({
      where: { published: true },
      orderBy: [{ day: "asc" }, { start: "asc" }, { order: "asc" }],
      include: { talks: { orderBy: [{ order: "asc" }] } },
    }),
    prisma.setting.findUnique({ where: { key: "programmeStatus" } }),
  ]);

  const updatedAt = sessions.reduce<Date | null>(
    (max, s) => (!max || s.updatedAt > max ? s.updatedAt : max),
    null,
  );

  return {
    status: status?.value === "definitivo" ? "definitivo" : "provisional",
    days: days.map(({ key, labelEs, labelPt }) => ({ key, labelEs, labelPt })),
    venues: venues.map((v) => ({ ...v })),
    rooms: rooms.map((r) => ({ ...r })),
    sessions: sessions.map((s) => ({
      id: s.id,
      day: s.day,
      start: s.start,
      end: s.end,
      type: s.type as SessionTypeKey,
      title: s.title,
      titlePt: s.titlePt,
      subtitle: s.subtitle,
      subtitlePt: s.subtitlePt,
      description: s.description,
      descriptionPt: s.descriptionPt,
      speakers: s.speakers,
      chair: s.chair,
      roomId: s.roomId,
      venueId: s.venueId,
      location: s.location,
      locationPt: s.locationPt,
      streamUrl: s.streamUrl,
      cancelled: s.cancelled,
      talks: s.talks.map((t) => ({
        id: t.id,
        order: t.order,
        title: t.title,
        authors: t.authors,
        presenter: t.presenter,
        abstract: t.abstract,
        axis: t.axis,
      })),
    })),
    updatedAt: updatedAt ? updatedAt.toISOString() : null,
  };
}

// ─── Ayudantes de presentación (válidos en servidor y cliente) ─────────

/**
 * Lo que usan las páginas públicas.
 *
 * - Modo servidor: cada visita lee la base de datos (lo editado en el panel se
 *   ve al momento) y, si la base de datos no responde, la página se pinta sin
 *   programa en vez de romperse.
 * - Versión estática: se lee una vez al compilar y cualquier error hace fallar
 *   la compilación, para no publicar nunca una web sin programa.
 */
export async function loadProgramme(where: string): Promise<ProgrammeData | null> {
  if (STATIC_EXPORT) return getProgramme();
  await connection();
  try {
    return await getProgramme();
  } catch (e) {
    console.error(`[${where}] no se pudo leer el programa:`, e);
    return null;
  }
}
