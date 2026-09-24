import "server-only";
import { cache } from "react";
import type { Prisma, Session, Talk } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SESSION_TYPE_META, type SessionTypeKey } from "@/lib/session-types";
import { HttpError } from "@/lib/admin/errors";
import { describeLocation } from "@/lib/admin/location";
import { normalizeSearch, textLines } from "@/lib/admin/format";
import type { SessionFlags, SessionInput, TalkInput } from "@/lib/admin/schemas";
import type { SessionData, SessionRow, TalkData } from "@/lib/admin/types";

/**
 * Servicio de sesiones del panel (CRUD + duplicar + publicar). Lo usan las
 * páginas (lectura) y los route handlers de /api/admin/sessions (escritura).
 */

// ─── Serialización ────────────────────────────────────────────────────

function toTalkData(t: Talk): TalkData {
  return {
    id: t.id,
    order: t.order,
    title: t.title,
    authors: t.authors,
    presenter: t.presenter,
    abstract: t.abstract,
    axis: t.axis,
  };
}

export function toSessionData(s: Session & { talks: Talk[] }): SessionData {
  return {
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
    published: s.published,
    order: s.order,
    talks: [...s.talks].sort((a, b) => a.order - b.order).map(toTalkData),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

const SESSION_ORDER: Prisma.SessionOrderByWithRelationInput[] = [
  { day: "asc" },
  { start: "asc" },
  { order: "asc" },
  { end: "asc" },
];

// ─── Lectura ──────────────────────────────────────────────────────────

/** Filas del listado del programa (todas: publicadas, borradores y canceladas). */
export async function listSessionRows(): Promise<SessionRow[]> {
  const [sessions, venues, rooms] = await Promise.all([
    prisma.session.findMany({
      orderBy: SESSION_ORDER,
      include: { talks: { select: { title: true, authors: true, presenter: true } } },
    }),
    prisma.venue.findMany({ select: { id: true, name: true } }),
    prisma.room.findMany({ select: { id: true, venueId: true, name: true, active: true } }),
  ]);
  const venueMap = new Map(venues.map((v) => [v.id, v]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  return sessions.map((s) => {
    const where = describeLocation(s, venueMap, roomMap);
    const detail = [where.detail, s.location].filter(Boolean).join(" · ") || null;
    const type = s.type as SessionTypeKey;
    const search = normalizeSearch(
      [
        s.title,
        s.titlePt,
        s.subtitle,
        s.subtitlePt,
        s.speakers,
        s.chair,
        s.location,
        where.label,
        where.detail,
        SESSION_TYPE_META[type]?.label.es,
        s.start,
        ...s.talks.flatMap((t) => [t.title, t.authors, t.presenter]),
      ]
        .filter(Boolean)
        .join(" "),
    );
    return {
      id: s.id,
      day: s.day,
      start: s.start,
      end: s.end,
      type,
      title: s.title,
      titlePt: s.titlePt,
      subtitle: s.subtitle,
      roomId: s.roomId,
      venueId: s.venueId,
      location: s.location,
      published: s.published,
      cancelled: s.cancelled,
      speakersCount: textLines(s.speakers).length,
      talksCount: s.talks.length,
      locationLabel: where.label,
      locationDetail: detail,
      search,
    };
  });
}

/** Sesión completa con sus contribuciones (deduplicada por petición). */
export const getSessionData = cache(async (id: string): Promise<SessionData | null> => {
  const s = await prisma.session.findUnique({
    where: { id },
    include: { talks: { orderBy: { order: "asc" } } },
  });
  return s ? toSessionData(s) : null;
});

// ─── Escritura ────────────────────────────────────────────────────────

/** Comprueba que el día, la sala o el edificio existen (400 con el campo culpable). */
async function assertReferences(input: SessionInput): Promise<void> {
  const day = await prisma.day.findUnique({ where: { key: input.day }, select: { key: true } });
  if (!day) {
    throw new HttpError(400, "El día elegido no existe.", [
      { path: "day", message: `El día ${input.day} no está en la tabla de días (créalo en Ajustes).` },
    ]);
  }
  if (input.roomId) {
    const room = await prisma.room.findUnique({ where: { id: input.roomId }, select: { id: true } });
    if (!room) {
      throw new HttpError(400, "La sala elegida no existe.", [
        { path: "roomId", message: "Esa sala ya no existe. Elige otra ubicación." },
      ]);
    }
  } else if (input.venueId) {
    const venue = await prisma.venue.findUnique({ where: { id: input.venueId }, select: { id: true } });
    if (!venue) {
      throw new HttpError(400, "El edificio elegido no existe.", [
        { path: "venueId", message: "Ese edificio ya no existe. Elige otra ubicación." },
      ]);
    }
  }
}

/** Campos de la sesión (sin contribuciones ni orden). */
function sessionFields(input: SessionInput) {
  return {
    day: input.day,
    start: input.start,
    end: input.end,
    type: input.type,
    title: input.title,
    titlePt: input.titlePt,
    subtitle: input.subtitle,
    subtitlePt: input.subtitlePt,
    description: input.description,
    descriptionPt: input.descriptionPt,
    speakers: input.speakers,
    chair: input.chair,
    // Ámbito: con sala, el edificio se deduce de la sala (como en la semilla)
    roomId: input.roomId,
    venueId: input.roomId ? null : input.venueId,
    location: input.location,
    locationPt: input.locationPt,
    streamUrl: input.streamUrl,
    published: input.published,
    cancelled: input.cancelled,
  } satisfies Omit<Prisma.SessionUncheckedCreateInput, "order" | "talks">;
}

function talkFields(t: TalkInput, order: number) {
  return {
    order,
    title: t.title,
    authors: t.authors,
    presenter: t.presenter,
    abstract: t.abstract,
    axis: t.axis,
  };
}

async function nextOrder(): Promise<number> {
  const agg = await prisma.session.aggregate({ _max: { order: true } });
  return (agg._max.order ?? -1) + 1;
}

export async function createSession(input: SessionInput): Promise<SessionData> {
  await assertReferences(input);
  const created = await prisma.session.create({
    data: {
      ...sessionFields(input),
      order: input.order ?? (await nextOrder()),
      talks: { create: input.talks.map((t, i) => talkFields(t, i)) },
    },
    include: { talks: { orderBy: { order: "asc" } } },
  });
  return toSessionData(created);
}

/**
 * Actualiza la sesión y sincroniza sus contribuciones en una transacción:
 * conserva el id de las que ya existían (por si la web pública los usa como
 * ancla), crea las nuevas, borra las quitadas y guarda el orden recibido.
 */
export async function updateSession(id: string, input: SessionInput): Promise<SessionData> {
  const existing = await prisma.session.findUnique({
    where: { id },
    select: { id: true, talks: { select: { id: true } } },
  });
  if (!existing) throw new HttpError(404, "La sesión no existe (puede que se haya borrado).");
  await assertReferences(input);

  const ownIds = new Set(existing.talks.map((t) => t.id));
  const seen = new Set<string>();
  const keep = input.talks.map((t) => {
    const reuse = t.id && ownIds.has(t.id) && !seen.has(t.id) ? t.id : null;
    if (reuse) seen.add(reuse);
    return reuse;
  });

  const updated = await prisma.$transaction(async (tx) => {
    await tx.talk.deleteMany({ where: { sessionId: id, id: { notIn: [...seen] } } });
    for (const [i, t] of input.talks.entries()) {
      const talkId = keep[i];
      if (talkId) await tx.talk.update({ where: { id: talkId }, data: talkFields(t, i) });
      else await tx.talk.create({ data: { ...talkFields(t, i), sessionId: id } });
    }
    return tx.session.update({
      where: { id },
      data: { ...sessionFields(input), ...(input.order !== null ? { order: input.order } : {}) },
      include: { talks: { orderBy: { order: "asc" } } },
    });
  });
  return toSessionData(updated);
}

/** Publicar / despublicar / cancelar sin tocar el resto. */
export async function setSessionFlags(id: string, flags: SessionFlags): Promise<SessionData> {
  const data: Prisma.SessionUpdateInput = {};
  if (flags.published !== undefined) data.published = flags.published;
  if (flags.cancelled !== undefined) data.cancelled = flags.cancelled;
  const updated = await prisma.session.update({
    where: { id },
    data,
    include: { talks: { orderBy: { order: "asc" } } },
  });
  return toSessionData(updated);
}

/** Copia como BORRADOR (no aparece en la web hasta publicarla). */
export async function duplicateSession(id: string): Promise<SessionData> {
  const src = await prisma.session.findUnique({
    where: { id },
    include: { talks: { orderBy: { order: "asc" } } },
  });
  if (!src) throw new HttpError(404, "La sesión no existe (puede que se haya borrado).");
  const copy = await prisma.session.create({
    data: {
      day: src.day,
      start: src.start,
      end: src.end,
      type: src.type,
      title: `${src.title} (copia)`.slice(0, 300),
      titlePt: src.titlePt ? `${src.titlePt} (cópia)`.slice(0, 300) : null,
      subtitle: src.subtitle,
      subtitlePt: src.subtitlePt,
      description: src.description,
      descriptionPt: src.descriptionPt,
      speakers: src.speakers,
      chair: src.chair,
      roomId: src.roomId,
      venueId: src.venueId,
      location: src.location,
      locationPt: src.locationPt,
      streamUrl: src.streamUrl,
      cancelled: src.cancelled,
      published: false,
      order: src.order,
      talks: {
        create: src.talks.map((t, i) => ({
          order: i,
          title: t.title,
          authors: t.authors,
          presenter: t.presenter,
          abstract: t.abstract,
          axis: t.axis,
        })),
      },
    },
    include: { talks: { orderBy: { order: "asc" } } },
  });
  return toSessionData(copy);
}

export async function deleteSession(id: string): Promise<{ id: string; talks: number }> {
  const s = await prisma.session.findUnique({ where: { id }, select: { id: true, _count: { select: { talks: true } } } });
  if (!s) throw new HttpError(404, "La sesión no existe (puede que ya se haya borrado).");
  await prisma.session.delete({ where: { id } });
  return { id, talks: s._count.talks };
}
