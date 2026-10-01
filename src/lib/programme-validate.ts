import { SESSION_TYPE_META, type SessionTypeKey } from "@/lib/session-types";

/**
 * Validación del programa: equivale a la pestaña «Validación» del editor
 * /backstage de ICED26, pero sobre los datos de la BD.
 *
 * Es una función PURA (no toca Prisma): recibe sesiones, salas, edificios y
 * días ya leídos y devuelve la lista de avisos. Así se prueba con vitest y
 * se puede usar tanto en el servidor como en el cliente.
 *
 * Gravedad:
 *   · error       → solape en la misma sala; hora mal formada; fin ≤ inicio;
 *                   día que no está en la tabla Day; sala o edificio que no
 *                   existe.
 *   · aviso       → sesión de sala que coincide con una sesión de «todo el
 *                   edificio» de su mismo edificio (o dos de edificio a la
 *                   vez); coincidencia con una fila general que no es pausa
 *                   ni acreditación (o dos filas generales a la vez); sala
 *                   inactiva con sesiones; sala que no pertenece al edificio
 *                   indicado en la sesión.
 *   · sugerencia  → sesión sin publicar (borrador); ponencia, panel o mesa
 *                   redonda sin ponentes.
 *
 * Criterios:
 *   · Los intervalos son semiabiertos [inicio, fin): una sesión que acaba a
 *     las 10:00 y otra que empieza a las 10:00 NO se solapan.
 *   · Las sesiones canceladas no ocupan el espacio: no cuentan para los
 *     solapes (sí para el resto de comprobaciones).
 *   · Los borradores SÍ cuentan para los solapes: son sesiones previstas.
 *   · Las sesiones con horas no válidas no participan en los solapes (ya
 *     tienen su propio error).
 */

/** HH:MM en 24 h (00:00–23:59). */
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export type IssueSeverity = "error" | "warning" | "info";

export type IssueCode =
  | "ROOM_OVERLAP"
  | "VENUE_OVERLAP"
  | "GLOBAL_OVERLAP"
  | "INVALID_TIME"
  | "END_NOT_AFTER_START"
  | "UNKNOWN_DAY"
  | "UNKNOWN_ROOM"
  | "UNKNOWN_VENUE"
  | "ROOM_VENUE_MISMATCH"
  | "INACTIVE_ROOM"
  | "UNPUBLISHED"
  | "MISSING_SPEAKERS";

export interface ValidationSession {
  id: string;
  day: string;
  start: string;
  end: string;
  type: SessionTypeKey;
  title: string;
  roomId: string | null;
  venueId: string | null;
  published: boolean;
  cancelled: boolean;
  speakers: string | null;
  /** Autores de sus contribuciones (talleres, experiencias de una mesa…) */
  talks?: { authors: string | null }[];
}

export interface ValidationRoom {
  id: string;
  venueId: string;
  name: string;
  active: boolean;
}

export interface ValidationVenue {
  id: string;
  name: string;
}

export interface ValidationDay {
  key: string;
}

export interface ValidationInput {
  sessions: ValidationSession[];
  rooms: ValidationRoom[];
  venues: ValidationVenue[];
  days: ValidationDay[];
}

/** Sesión citada en un aviso (para enlazar a su edición). */
export interface IssueSessionRef {
  id: string;
  title: string;
  day: string;
  start: string;
  end: string;
}

export interface ValidationIssue {
  /** Clave única y estable (sirve como `key` de React). */
  key: string;
  code: IssueCode;
  severity: IssueSeverity;
  /** Mensaje en español, listo para mostrar. */
  message: string;
  /** Día afectado (null en avisos que no son de un día concreto). */
  day: string | null;
  /** Sesiones implicadas; la primera es la principal. */
  sessions: IssueSessionRef[];
  /** Sala implicada, si la hay. */
  roomId: string | null;
}

/** Tipos que pueden convivir con otras sesiones aunque sean fila general. */
const LOGISTIC_TYPES: ReadonlySet<SessionTypeKey> = new Set<SessionTypeKey>(["PAUSA", "ACREDITACION"]);

/** Tipos que deberían tener ponentes. */
const SPEAKER_TYPES: ReadonlySet<SessionTypeKey> = new Set<SessionTypeKey>([
  "PONENCIA",
  "PANEL_EXPERTOS",
  "MESA_REDONDA",
]);

const SEVERITY_RANK: Record<IssueSeverity, number> = { error: 0, warning: 1, info: 2 };

export function isValidTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

/** "09:30" → 570. Solo para horas ya validadas. */
export function timeToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

/** ¿Tiene al menos un ponente (texto con uno por línea)? */
export function hasSpeakers(speakers: string | null | undefined): boolean {
  return (speakers ?? "").split(/\r?\n/).some((line) => line.trim() !== "");
}

/** Recuento de avisos por gravedad. */
export function countIssues(issues: ValidationIssue[]): Record<IssueSeverity, number> {
  const out: Record<IssueSeverity, number> = { error: 0, warning: 0, info: 0 };
  for (const issue of issues) out[issue.severity] += 1;
  return out;
}

type Scope = "room" | "venue" | "global";

interface Placed {
  s: ValidationSession;
  from: number;
  to: number;
  scope: Scope;
  /** Edificio efectivo: el de la sala, o el de la sesión de edificio. */
  venueId: string | null;
}

type Draft = Omit<ValidationIssue, "key">;

const quote = (title: string) => `«${title.trim() || "Sin título"}»`;
const span = (s: ValidationSession) => `${s.start}–${s.end}`;
const typeLabel = (type: SessionTypeKey) => SESSION_TYPE_META[type]?.label.es ?? type;

function ref(s: ValidationSession): IssueSessionRef {
  return { id: s.id, title: s.title, day: s.day, start: s.start, end: s.end };
}

function compareSessions(a: ValidationSession, b: ValidationSession): number {
  return a.day.localeCompare(b.day) || a.start.localeCompare(b.start) || a.end.localeCompare(b.end);
}

function compareIssues(a: ValidationIssue, b: ValidationIssue): number {
  return (
    SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
    // Los avisos sin día (p. ej. sala inactiva) van al final de su grupo
    (a.day ?? "￿").localeCompare(b.day ?? "￿") ||
    (a.sessions[0]?.start ?? "").localeCompare(b.sessions[0]?.start ?? "") ||
    a.code.localeCompare(b.code) ||
    a.key.localeCompare(b.key)
  );
}

export function validateProgramme(input: ValidationInput): ValidationIssue[] {
  const rooms = new Map(input.rooms.map((r) => [r.id, r]));
  const venues = new Map(input.venues.map((v) => [v.id, v]));
  const dayKeys = new Set(input.days.map((d) => d.key));
  const roomName = (id: string | null) => (id ? rooms.get(id)?.name ?? id : "");
  const venueName = (id: string | null) => (id ? venues.get(id)?.name ?? id : "");

  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  const add = (draft: Draft, suffix = "") => {
    let key = `${draft.code}:${draft.sessions.map((s) => s.id).join("+")}${suffix ? `:${suffix}` : ""}`;
    // Garantiza claves únicas aunque los datos traigan ids repetidos
    for (let n = 2; seen.has(key); n++) key = `${key}#${n}`;
    seen.add(key);
    issues.push({ ...draft, key });
  };

  // ─── 1) Comprobaciones de cada sesión ────────────────────────────────
  const placed: Placed[] = [];
  for (const s of input.sessions) {
    const one = [ref(s)];
    const startOk = isValidTime(s.start);
    const endOk = isValidTime(s.end);

    if (!startOk) {
      add(
        {
          code: "INVALID_TIME",
          severity: "error",
          message: `${quote(s.title)}: la hora de inicio «${s.start}» no es válida (formato HH:MM).`,
          day: s.day,
          sessions: one,
          roomId: s.roomId,
        },
        "start",
      );
    }
    if (!endOk) {
      add(
        {
          code: "INVALID_TIME",
          severity: "error",
          message: `${quote(s.title)}: la hora de fin «${s.end}» no es válida (formato HH:MM).`,
          day: s.day,
          sessions: one,
          roomId: s.roomId,
        },
        "end",
      );
    }
    const timesOk = startOk && endOk && timeToMinutes(s.end) > timeToMinutes(s.start);
    if (startOk && endOk && !timesOk) {
      add({
        code: "END_NOT_AFTER_START",
        severity: "error",
        message: `${quote(s.title)}: la hora de fin (${s.end}) debe ser posterior a la de inicio (${s.start}).`,
        day: s.day,
        sessions: one,
        roomId: s.roomId,
      });
    }

    if (!dayKeys.has(s.day)) {
      add({
        code: "UNKNOWN_DAY",
        severity: "error",
        message: `${quote(s.title)}: el día «${s.day}» no está en la tabla de días del congreso.`,
        day: s.day,
        sessions: one,
        roomId: s.roomId,
      });
    }

    // Ámbito y edificio efectivo
    let venueId: string | null = null;
    if (s.roomId) {
      const room = rooms.get(s.roomId);
      if (!room) {
        add({
          code: "UNKNOWN_ROOM",
          severity: "error",
          message: `${quote(s.title)}: la sala «${s.roomId}» no existe.`,
          day: s.day,
          sessions: one,
          roomId: s.roomId,
        });
      } else {
        venueId = room.venueId;
        if (s.venueId && s.venueId !== room.venueId) {
          add({
            code: "ROOM_VENUE_MISMATCH",
            severity: "warning",
            message: `${quote(s.title)}: la sala ${room.name} no pertenece al edificio ${venueName(s.venueId)} indicado en la sesión.`,
            day: s.day,
            sessions: one,
            roomId: s.roomId,
          });
        }
      }
    } else if (s.venueId) {
      venueId = s.venueId;
      if (!venues.has(s.venueId)) {
        add({
          code: "UNKNOWN_VENUE",
          severity: "error",
          message: `${quote(s.title)}: el edificio «${s.venueId}» no existe.`,
          day: s.day,
          sessions: one,
          roomId: null,
        });
      }
    }

    if (!s.published) {
      add({
        code: "UNPUBLISHED",
        severity: "info",
        message: `${quote(s.title)} es un borrador: no se muestra en la web pública.`,
        day: s.day,
        sessions: one,
        roomId: s.roomId,
      });
    }

    if (SPEAKER_TYPES.has(s.type) && !hasSpeakers(s.speakers) && !s.talks?.some((t) => hasSpeakers(t.authors))) {
      const kind = typeLabel(s.type).toLowerCase();
      // «Ponencia invitada (ponencia invitada)» sobra: el tipo solo se añade si aporta
      const suffix = s.title.trim().toLowerCase() === kind ? "" : ` (${kind})`;
      add({
        code: "MISSING_SPEAKERS",
        severity: "info",
        message: `${quote(s.title)}${suffix} no tiene ponentes.`,
        day: s.day,
        sessions: one,
        roomId: s.roomId,
      });
    }

    if (timesOk && !s.cancelled) {
      placed.push({
        s,
        from: timeToMinutes(s.start),
        to: timeToMinutes(s.end),
        scope: s.roomId ? "room" : s.venueId ? "venue" : "global",
        venueId,
      });
    }
  }

  // ─── 2) Salas inactivas con sesiones ─────────────────────────────────
  const inactive = new Map<string, ValidationSession[]>();
  for (const s of input.sessions) {
    const room = s.roomId ? rooms.get(s.roomId) : undefined;
    if (room && !room.active) inactive.set(room.id, [...(inactive.get(room.id) ?? []), s]);
  }
  for (const [roomId, list] of inactive) {
    list.sort(compareSessions);
    const n = list.length;
    add({
      code: "INACTIVE_ROOM",
      severity: "warning",
      message: `La sala ${roomName(roomId)} está desactivada pero tiene ${n} ${n === 1 ? "sesión asignada" : "sesiones asignadas"}.`,
      day: null,
      sessions: list.map(ref),
      roomId,
    });
  }

  // ─── 3) Solapes (por día) ────────────────────────────────────────────
  const byDay = new Map<string, Placed[]>();
  for (const p of placed) byDay.set(p.s.day, [...(byDay.get(p.s.day) ?? []), p]);

  for (const list of byDay.values()) {
    list.sort((a, b) => a.from - b.from || a.to - b.to || a.s.id.localeCompare(b.s.id));
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        // Ordenadas por inicio: si esta no solapa, las siguientes tampoco
        if (b.from >= a.to) break;
        const draft = classifyOverlap(a, b, roomName, venueName);
        if (draft) add(draft);
      }
    }
  }

  return issues.sort(compareIssues);
}

/** Decide si el solape de dos sesiones es un conflicto y lo describe. */
function classifyOverlap(
  a: Placed,
  b: Placed,
  roomName: (id: string | null) => string,
  venueName: (id: string | null) => string,
): Draft | null {
  const base = { day: a.s.day, sessions: [ref(a.s), ref(b.s)] };

  // Misma sala
  if (a.scope === "room" && b.scope === "room") {
    if (a.s.roomId !== b.s.roomId) return null;
    return {
      ...base,
      code: "ROOM_OVERLAP",
      severity: "error",
      message: `Dos sesiones a la vez en ${roomName(a.s.roomId)}: ${quote(a.s.title)} (${span(a.s)}) y ${quote(b.s.title)} (${span(b.s)}).`,
      roomId: a.s.roomId,
    };
  }

  // Fila general
  if (a.scope === "global" && b.scope === "global") {
    // Una actividad durante una pausa (visita en el almuerzo) es normal
    if (LOGISTIC_TYPES.has(a.s.type) !== LOGISTIC_TYPES.has(b.s.type)) return null;
    return {
      ...base,
      code: "GLOBAL_OVERLAP",
      severity: "warning",
      message: `Dos filas generales se solapan: ${quote(a.s.title)} (${span(a.s)}) y ${quote(b.s.title)} (${span(b.s)}).`,
      roomId: null,
    };
  }
  if (a.scope === "global" || b.scope === "global") {
    const general = a.scope === "global" ? a : b;
    const other = general === a ? b : a;
    // Las pausas y acreditaciones pueden convivir con otras sesiones
    if (LOGISTIC_TYPES.has(general.s.type)) return null;
    return {
      ...base,
      sessions: [ref(other.s), ref(general.s)],
      code: "GLOBAL_OVERLAP",
      severity: "warning",
      message: `${quote(other.s.title)} (${span(other.s)}) coincide con la fila general ${quote(general.s.title)} (${typeLabel(general.s.type).toLowerCase()}, ${span(general.s)}).`,
      roomId: other.s.roomId,
    };
  }

  // Mismo edificio
  if (!a.venueId || a.venueId !== b.venueId) return null;
  if (a.scope === "venue" && b.scope === "venue") {
    return {
      ...base,
      code: "VENUE_OVERLAP",
      severity: "warning",
      message: `${quote(a.s.title)} (${span(a.s)}) y ${quote(b.s.title)} (${span(b.s)}) ocupan a la vez todo el edificio ${venueName(a.venueId)}.`,
      roomId: null,
    };
  }
  const whole = a.scope === "venue" ? a : b;
  const inRoom = whole === a ? b : a;
  return {
    ...base,
    sessions: [ref(inRoom.s), ref(whole.s)],
    code: "VENUE_OVERLAP",
    severity: "warning",
    message: `${quote(inRoom.s.title)} (${roomName(inRoom.s.roomId)}, ${span(inRoom.s)}) coincide con ${quote(whole.s.title)} (${span(whole.s)}), que ocupa todo el edificio ${venueName(whole.venueId)}.`,
    roomId: inRoom.s.roomId,
  };
}
