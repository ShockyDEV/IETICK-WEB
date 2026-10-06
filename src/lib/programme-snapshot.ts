import type { PrismaClient } from "@prisma/client";

/**
 * Instantánea del programa: lo que se publica en la web estática.
 *
 * `npm run programa:publicar` la guarda desde la base de datos local (lo
 * editado en el panel) en prisma/programa-publicado.json; al compilar en
 * GitHub, la semilla la carga en una base de datos vacía y las páginas se
 * generan con ella. Incluye borradores, canceladas y salas inactivas (la web
 * filtra igual que en modo servidor). Nunca incluye cuentas de usuario.
 */
export const SNAPSHOT_FILE = "prisma/programa-publicado.json";
export const SNAPSHOT_FORMAT = "ietic27-programme";
export const SNAPSHOT_VERSION = 1;

/** Todo el programa, en un orden estable (lo usa también la exportación del panel). */
export function fetchProgrammeRecords(db: PrismaClient) {
  return Promise.all([
    db.venue.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    db.room.findMany({ orderBy: [{ venueId: "asc" }, { order: "asc" }, { name: "asc" }] }),
    db.day.findMany({ orderBy: [{ order: "asc" }, { key: "asc" }] }),
    db.session.findMany({
      orderBy: [{ day: "asc" }, { start: "asc" }, { order: "asc" }, { end: "asc" }, { id: "asc" }],
      include: { talks: { orderBy: [{ order: "asc" }, { id: "asc" }] } },
    }),
    db.setting.findMany({ orderBy: { key: "asc" } }),
  ]);
}

export async function readProgrammeSnapshot(db: PrismaClient) {
  const [venues, rooms, days, sessions, settings] = await fetchProgrammeRecords(db);
  return {
    format: SNAPSHOT_FORMAT,
    version: SNAPSHOT_VERSION,
    settings: Object.fromEntries(settings.map((s) => [s.key, s.value])),
    venues,
    rooms,
    days,
    // Las fechas de cada sesión se conservan: la página del programa muestra
    // cuándo se actualizó por última vez.
    sessions: sessions.map(({ talks, createdAt, updatedAt, ...s }) => ({
      ...s,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      talks: talks.map(({ sessionId: _sessionId, ...t }) => t),
    })),
  };
}

export type ProgrammeSnapshot = Awaited<ReturnType<typeof readProgrammeSnapshot>>;

/** Comprobación mínima de que el fichero es una instantánea de este proyecto. */
export function assertSnapshot(data: unknown): asserts data is ProgrammeSnapshot {
  const d = data as Partial<ProgrammeSnapshot> | null;
  if (!d || d.format !== SNAPSHOT_FORMAT || d.version !== SNAPSHOT_VERSION) {
    throw new Error(`${SNAPSHOT_FILE} no es una instantánea válida del programa (${SNAPSHOT_FORMAT} v${SNAPSHOT_VERSION}).`);
  }
  for (const key of ["venues", "rooms", "days", "sessions"] as const) {
    if (!Array.isArray(d[key])) throw new Error(`${SNAPSHOT_FILE}: falta la lista «${key}».`);
  }
}
