import { sessionScope, type ProgrammeData, type ProgrammeRoom, type ProgrammeSession, type ProgrammeVenue } from "@/lib/programme";
import { hmToMinutes } from "@/lib/time";

/**
 * Geometría de la parrilla del programa (funciones puras, con tests).
 *
 * A diferencia de ICED26 —que tenía decenas de salas y obligaba a navegar
 * por edificio— aquí caben todas las salas a la vez: las columnas son las
 * salas agrupadas por edificio, y cada sesión ocupa
 *   · su columna (sesión de sala),
 *   · el tramo de su edificio (sesiones simultáneas aún sin aula), o
 *   · todas las columnas (filas generales: pausas, acreditaciones…).
 */

export interface GridColumn {
  room: ProgrammeRoom;
  venue: ProgrammeVenue;
  index: number;
}

export interface VenueBand {
  venue: ProgrammeVenue;
  start: number;
  span: number;
}

export interface PlacedSession {
  session: ProgrammeSession;
  kind: "room" | "venue" | "global";
  col: number;
  span: number;
  startMin: number;
  endMin: number;
  /** Carril y nº de carriles cuando dos sesiones se solapan en la misma sala */
  lane: number;
  lanes: number;
}

export function buildColumns(data: Pick<ProgrammeData, "rooms" | "venues">): {
  columns: GridColumn[];
  bands: VenueBand[];
} {
  const venues = [...data.venues].sort((a, b) => a.order - b.order);
  const columns: GridColumn[] = [];
  const bands: VenueBand[] = [];
  for (const venue of venues) {
    const rooms = data.rooms.filter((r) => r.venueId === venue.id).sort((a, b) => a.order - b.order);
    if (!rooms.length) continue;
    bands.push({ venue, start: columns.length, span: rooms.length });
    for (const room of rooms) columns.push({ room, venue, index: columns.length });
  }
  return { columns, bands };
}

export function placeSessions(sessions: ProgrammeSession[], columns: GridColumn[], bands: VenueBand[]): PlacedSession[] {
  const placed: PlacedSession[] = [];
  for (const s of sessions) {
    const startMin = hmToMinutes(s.start);
    const endMin = hmToMinutes(s.end);
    const scope = sessionScope(s);
    if (scope === "room") {
      const col = columns.find((c) => c.room.id === s.roomId);
      if (!col) continue; // sala inactiva o inexistente: no se pinta
      placed.push({ session: s, kind: "room", col: col.index, span: 1, startMin, endMin, lane: 0, lanes: 1 });
    } else if (scope === "venue") {
      const band = bands.find((b) => b.venue.id === s.venueId);
      if (!band) continue;
      placed.push({ session: s, kind: "venue", col: band.start, span: band.span, startMin, endMin, lane: 0, lanes: 1 });
    } else {
      placed.push({ session: s, kind: "global", col: 0, span: Math.max(1, columns.length), startMin, endMin, lane: 0, lanes: 1 });
    }
  }

  // Carriles: sesiones de la MISMA sala que se solapan se reparten en paralelo
  // (empaquetado voraz por columnas, como en el programa de ICED26).
  const byCol = new Map<number, PlacedSession[]>();
  for (const p of placed) {
    if (p.kind !== "room") continue;
    const list = byCol.get(p.col) ?? [];
    list.push(p);
    byCol.set(p.col, list);
  }
  for (const list of byCol.values()) {
    list.sort((a, b) => a.startMin - b.startMin || b.endMin - b.startMin - (a.endMin - a.startMin));
    const laneEnds: number[] = [];
    for (const p of list) {
      let lane = laneEnds.findIndex((end) => end <= p.startMin);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(p.endMin);
      } else {
        laneEnds[lane] = p.endMin;
      }
      p.lane = lane;
    }
    for (const p of list) {
      const concurrent = list.filter((o) => o.startMin < p.endMin && o.endMin > p.startMin);
      p.lanes = Math.max(...concurrent.map((o) => o.lane)) + 1;
    }
  }
  return placed;
}

/** Tramo horario visible (redondeado a medias horas). */
export function timeRange(sessions: Pick<ProgrammeSession, "start" | "end">[]): { start: number; end: number } {
  if (!sessions.length) return { start: 9 * 60, end: 14 * 60 };
  const start = Math.min(...sessions.map((s) => hmToMinutes(s.start)));
  const end = Math.max(...sessions.map((s) => hmToMinutes(s.end)));
  return { start: Math.floor(start / 30) * 30, end: Math.ceil(end / 30) * 30 };
}
