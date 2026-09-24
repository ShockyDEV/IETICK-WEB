import "server-only";
import { prisma } from "@/lib/prisma";
import type { AdminUser } from "@/lib/admin/guard";

/**
 * Exportación completa del programa en JSON (equivale al «Export
 * programme.js» del editor de ICED26): edificios, salas, días, sesiones con
 * sus contribuciones y ajustes. Incluye borradores, canceladas y salas
 * inactivas. Nunca incluye cuentas de usuario.
 */
export const EXPORT_FORMAT = "ietic27-programme";
export const EXPORT_VERSION = 1;

export async function buildProgrammeExport(user: AdminUser) {
  const [venues, rooms, days, sessions, settings] = await Promise.all([
    prisma.venue.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.room.findMany({ orderBy: [{ venueId: "asc" }, { order: "asc" }, { name: "asc" }] }),
    prisma.day.findMany({ orderBy: [{ order: "asc" }, { key: "asc" }] }),
    prisma.session.findMany({
      orderBy: [{ day: "asc" }, { start: "asc" }, { order: "asc" }, { end: "asc" }],
      include: { talks: { orderBy: { order: "asc" } } },
    }),
    prisma.setting.findMany({ orderBy: { key: "asc" } }),
  ]);

  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    exportedBy: user.email,
    counts: {
      venues: venues.length,
      rooms: rooms.length,
      days: days.length,
      sessions: sessions.length,
      talks: sessions.reduce((n, s) => n + s.talks.length, 0),
    },
    settings: Object.fromEntries(settings.map((s) => [s.key, s.value])),
    venues,
    rooms,
    days,
    sessions: sessions.map(({ talks, ...s }) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      talks: talks.map(({ sessionId: _sessionId, ...t }) => t),
    })),
  };
}

/** Nombre del fichero: ietic27-programa-2026-09-24-1203.json (hora de Madrid). */
export function exportFileName(now = new Date()): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const hour = String(Number(parts.hour) % 24).padStart(2, "0");
  return `ietic27-programa-${parts.year}-${parts.month}-${parts.day}-${hour}${parts.minute}.json`;
}
