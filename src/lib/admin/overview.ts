import "server-only";
import { prisma } from "@/lib/prisma";
import { SESSION_TYPES, type SessionTypeKey } from "@/lib/session-types";
import { validateProgramme, type ValidationInput, type ValidationIssue } from "@/lib/programme-validate";
import { getProgrammeStatus } from "@/lib/admin/settings";
import type { ProgrammeStatus } from "@/lib/admin/types";

/**
 * Datos del Resumen del panel y entrada del validador del programa.
 */

/** Lee de la BD todo lo que necesita `validateProgramme()`. */
export async function loadValidationInput(): Promise<ValidationInput> {
  const [sessions, rooms, venues, days] = await Promise.all([
    prisma.session.findMany({
      select: {
        id: true,
        day: true,
        start: true,
        end: true,
        type: true,
        title: true,
        roomId: true,
        venueId: true,
        published: true,
        cancelled: true,
        speakers: true,
        talks: { select: { authors: true } },
      },
    }),
    prisma.room.findMany({ select: { id: true, venueId: true, name: true, active: true } }),
    prisma.venue.findMany({ select: { id: true, name: true } }),
    prisma.day.findMany({ select: { key: true } }),
  ]);
  return {
    sessions: sessions.map((s) => ({ ...s, type: s.type as SessionTypeKey })),
    rooms,
    venues,
    days,
  };
}

export async function getProgrammeIssues(): Promise<ValidationIssue[]> {
  return validateProgramme(await loadValidationInput());
}

/** Avisos de una sesión concreta (para su página de edición). */
export async function getSessionIssues(sessionId: string): Promise<ValidationIssue[]> {
  const issues = await getProgrammeIssues();
  return issues.filter((i) => i.sessions.some((s) => s.id === sessionId));
}

/** Gravedad máxima de los avisos de cada sesión (para marcar filas del listado). */
export function issuesBySession(
  issues: ValidationIssue[],
): Record<string, { error: number; warning: number; info: number }> {
  const out: Record<string, { error: number; warning: number; info: number }> = {};
  for (const issue of issues) {
    for (const s of issue.sessions) {
      const entry = (out[s.id] ??= { error: 0, warning: 0, info: 0 });
      entry[issue.severity] += 1;
    }
  }
  return out;
}

export interface Overview {
  status: ProgrammeStatus;
  sessions: { total: number; published: number; drafts: number; cancelled: number };
  talks: number;
  byDay: { key: string; label: string; total: number; published: number; known: boolean }[];
  byType: { type: SessionTypeKey; count: number }[];
  rooms: { total: number; active: number; venues: number };
  roomsByVenue: { id: string; name: string; active: number; total: number }[];
  lastUpdate: string | null;
  issues: ValidationIssue[];
  dayLabels: Record<string, string>;
}

export async function getOverview(): Promise<Overview> {
  const [input, extra, talks, status, dayRows, venueRows] = await Promise.all([
    loadValidationInput(),
    prisma.session.aggregate({ _max: { updatedAt: true } }),
    prisma.talk.count(),
    getProgrammeStatus(),
    prisma.day.findMany({ orderBy: [{ order: "asc" }, { key: "asc" }] }),
    prisma.venue.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);
  const { sessions, rooms } = input;

  const byDay = dayRows.map((d) => {
    const list = sessions.filter((s) => s.day === d.key);
    return {
      key: d.key,
      label: d.labelEs,
      total: list.length,
      published: list.filter((s) => s.published).length,
      known: true,
    };
  });
  // Sesiones en días que no están en la tabla (el validador también avisa)
  const known = new Set(dayRows.map((d) => d.key));
  const orphanDays = [...new Set(sessions.map((s) => s.day).filter((k) => !known.has(k)))].sort();
  for (const key of orphanDays) {
    const list = sessions.filter((s) => s.day === key);
    byDay.push({
      key,
      label: `${key} (no está en Días)`,
      total: list.length,
      published: list.filter((s) => s.published).length,
      known: false,
    });
  }

  const byType = SESSION_TYPES.map((type) => ({
    type,
    count: sessions.filter((s) => s.type === type).length,
  })).filter((t) => t.count > 0);

  return {
    status,
    sessions: {
      total: sessions.length,
      published: sessions.filter((s) => s.published).length,
      drafts: sessions.filter((s) => !s.published).length,
      cancelled: sessions.filter((s) => s.cancelled).length,
    },
    talks,
    byDay,
    byType,
    rooms: {
      total: rooms.length,
      active: rooms.filter((r) => r.active).length,
      venues: venueRows.length,
    },
    roomsByVenue: venueRows.map((v) => {
      const list = rooms.filter((r) => r.venueId === v.id);
      return { id: v.id, name: v.name, total: list.length, active: list.filter((r) => r.active).length };
    }),
    lastUpdate: extra._max.updatedAt ? extra._max.updatedAt.toISOString() : null,
    issues: validateProgramme(input),
    dayLabels: Object.fromEntries(dayRows.map((d) => [d.key, d.labelEs])),
  };
}
