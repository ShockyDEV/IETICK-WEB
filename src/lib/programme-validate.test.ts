import { describe, expect, it } from "vitest";
import {
  countIssues,
  hasSpeakers,
  isValidTime,
  timeToMinutes,
  validateProgramme,
  type ValidationInput,
  type ValidationIssue,
  type ValidationSession,
} from "@/lib/programme-validate";
import { SEED_DAYS, SEED_ROOMS, SEED_SESSIONS, SEED_VENUES } from "@/content/programme-seed";

// ─── Datos de prueba ──────────────────────────────────────────────────

const DAYS = [{ key: "2027-02-11" }, { key: "2027-02-12" }];
const VENUES = [
  { id: "facultad", name: "Facultad de Educación" },
  { id: "iuce", name: "IUCE · Edificio Solís" },
];
const ROOMS = [
  { id: "salon-actos", venueId: "facultad", name: "Salón de actos", active: true },
  { id: "aula-17a", venueId: "iuce", name: "Aula 17A", active: true },
  { id: "aula-12a", venueId: "iuce", name: "Aula 12A", active: true },
];

let seq = 0;
function ses(partial: Partial<ValidationSession> = {}): ValidationSession {
  seq += 1;
  return {
    id: `s${seq}`,
    day: "2027-02-11",
    start: "10:00",
    end: "11:00",
    type: "TALLER",
    title: `Sesión ${seq}`,
    roomId: null,
    venueId: null,
    published: true,
    cancelled: false,
    speakers: null,
    ...partial,
  };
}

function run(sessions: ValidationSession[], extra: Partial<ValidationInput> = {}): ValidationIssue[] {
  return validateProgramme({ sessions, rooms: ROOMS, venues: VENUES, days: DAYS, ...extra });
}

const codes = (issues: ValidationIssue[]) => issues.map((i) => i.code);
const ids = (issue: ValidationIssue) => issue.sessions.map((s) => s.id);

// ─── Utilidades ───────────────────────────────────────────────────────

describe("utilidades de hora", () => {
  it("acepta HH:MM de 00:00 a 23:59 y rechaza el resto", () => {
    for (const ok of ["00:00", "09:30", "19:50", "23:59"]) expect(isValidTime(ok)).toBe(true);
    for (const bad of ["24:00", "9:30", "12:60", "12:5", "ab:cd", "", "10:00:00", " 10:00"]) {
      expect(isValidTime(bad)).toBe(false);
    }
  });

  it("convierte a minutos", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("detecta ponentes ignorando líneas vacías", () => {
    expect(hasSpeakers(null)).toBe(false);
    expect(hasSpeakers("")).toBe(false);
    expect(hasSpeakers("  \n\r\n  ")).toBe(false);
    expect(hasSpeakers("\nAna Pérez (USAL)\n")).toBe(true);
  });
});

// ─── Programa de la semilla ───────────────────────────────────────────

describe("programa provisional de la semilla", () => {
  const input: ValidationInput = {
    sessions: SEED_SESSIONS.map((s, i) => ({
      id: `seed-${i}`,
      day: s.day,
      start: s.start,
      end: s.end,
      type: s.type,
      title: s.title,
      roomId: s.roomId ?? null,
      venueId: s.venueId ?? null,
      published: true,
      cancelled: false,
      speakers: null,
    })),
    rooms: SEED_ROOMS.map((r) => ({ id: r.id, venueId: r.venueId, name: r.name, active: true })),
    venues: SEED_VENUES.map((v) => ({ id: v.id, name: v.name })),
    days: SEED_DAYS.map((d) => ({ key: d.key })),
  };

  it("no tiene errores ni avisos", () => {
    const issues = validateProgramme(input);
    const counts = countIssues(issues);
    expect(counts.error).toBe(0);
    expect(counts.warning).toBe(0);
  });

  it("solo sugiere añadir ponentes a ponencias, panel y mesa redonda", () => {
    const issues = validateProgramme(input);
    expect(new Set(codes(issues))).toEqual(new Set(["MISSING_SPEAKERS"]));
    const types = issues.map((i) => input.sessions.find((s) => s.id === i.sessions[0].id)?.type).sort();
    expect(types).toEqual(["MESA_REDONDA", "PANEL_EXPERTOS", "PONENCIA", "PONENCIA"]);
  });
});

// ─── Solapes ──────────────────────────────────────────────────────────

describe("solapes en la misma sala", () => {
  it("dos sesiones a la vez en la misma sala → error con ambas", () => {
    const a = ses({ roomId: "aula-17a", start: "10:00", end: "11:00" });
    const b = ses({ roomId: "aula-17a", start: "10:30", end: "12:00" });
    const issues = run([a, b]);
    expect(codes(issues)).toEqual(["ROOM_OVERLAP"]);
    expect(issues[0].severity).toBe("error");
    expect(ids(issues[0]).sort()).toEqual([a.id, b.id].sort());
    expect(issues[0].roomId).toBe("aula-17a");
    expect(issues[0].message).toContain("Aula 17A");
  });

  it("una sesión contenida dentro de otra también se solapa", () => {
    const a = ses({ roomId: "aula-17a", start: "09:00", end: "13:00" });
    const b = ses({ roomId: "aula-17a", start: "10:00", end: "10:30" });
    expect(codes(run([a, b]))).toEqual(["ROOM_OVERLAP"]);
  });

  it("sesiones que se tocan (fin = inicio) no se solapan", () => {
    const a = ses({ roomId: "aula-17a", start: "10:00", end: "11:00" });
    const b = ses({ roomId: "aula-17a", start: "11:00", end: "12:00" });
    expect(run([a, b])).toEqual([]);
  });

  it("salas distintas o días distintos no se solapan", () => {
    const a = ses({ roomId: "aula-17a" });
    const b = ses({ roomId: "aula-12a" });
    const c = ses({ roomId: "aula-17a", day: "2027-02-12" });
    expect(run([a, b, c])).toEqual([]);
  });

  it("detecta los tres pares cuando coinciden tres sesiones", () => {
    const list = [0, 1, 2].map(() => ses({ roomId: "salon-actos" }));
    const issues = run(list);
    expect(codes(issues)).toEqual(["ROOM_OVERLAP", "ROOM_OVERLAP", "ROOM_OVERLAP"]);
    expect(new Set(issues.map((i) => i.key)).size).toBe(3);
  });

  it("las sesiones canceladas no ocupan la sala", () => {
    const a = ses({ roomId: "aula-17a" });
    const b = ses({ roomId: "aula-17a", cancelled: true });
    expect(run([a, b])).toEqual([]);
  });

  it("los borradores sí cuentan para los solapes", () => {
    const a = ses({ roomId: "aula-17a" });
    const b = ses({ roomId: "aula-17a", published: false });
    expect(codes(run([a, b])).sort()).toEqual(["ROOM_OVERLAP", "UNPUBLISHED"]);
  });
});

describe("solapes con sesiones de todo el edificio", () => {
  it("sesión de sala frente a sesión de su edificio → aviso", () => {
    const whole = ses({ venueId: "iuce", title: "Talleres" });
    const inRoom = ses({ roomId: "aula-17a", start: "10:30", end: "11:30" });
    const issues = run([whole, inRoom]);
    expect(codes(issues)).toEqual(["VENUE_OVERLAP"]);
    expect(issues[0].severity).toBe("warning");
    // La sesión de sala va primero (es la que se suele mover)
    expect(ids(issues[0])).toEqual([inRoom.id, whole.id]);
    expect(issues[0].message).toContain("IUCE · Edificio Solís");
  });

  it("sesión de sala de OTRO edificio → nada", () => {
    const whole = ses({ venueId: "iuce" });
    const plenary = ses({ roomId: "salon-actos" });
    expect(run([whole, plenary])).toEqual([]);
  });

  it("dos sesiones de todo el mismo edificio a la vez → aviso", () => {
    const a = ses({ venueId: "iuce" });
    const b = ses({ venueId: "iuce", start: "10:59", end: "12:00" });
    const issues = run([a, b]);
    expect(codes(issues)).toEqual(["VENUE_OVERLAP"]);
  });

  it("sesiones de edificio de edificios distintos → nada", () => {
    expect(run([ses({ venueId: "iuce" }), ses({ venueId: "facultad" })])).toEqual([]);
  });
});

describe("solapes con la fila general", () => {
  it("una pausa o una acreditación pueden convivir con otras sesiones", () => {
    const pause = ses({ type: "PAUSA", start: "09:00", end: "12:00" });
    const accreditation = ses({ type: "ACREDITACION", day: "2027-02-12", start: "09:00", end: "10:00" });
    const inRoom = ses({ roomId: "aula-17a" });
    const whole = ses({ venueId: "iuce", day: "2027-02-12", start: "09:30", end: "10:30" });
    expect(run([pause, accreditation, inRoom, whole])).toEqual([]);
  });

  it("una fila general de otro tipo → aviso para cada sesión que coincide", () => {
    const visit = ses({ type: "SOCIAL", title: "Visita guiada", start: "10:00", end: "12:00" });
    const inRoom = ses({ roomId: "aula-17a" });
    const whole = ses({ venueId: "iuce", start: "11:00", end: "11:30" });
    const issues = run([visit, inRoom, whole]);
    expect(codes(issues)).toEqual(["GLOBAL_OVERLAP", "GLOBAL_OVERLAP"]);
    for (const issue of issues) {
      expect(issue.severity).toBe("warning");
      // La fila general va la segunda
      expect(issue.sessions[1].id).toBe(visit.id);
      expect(issue.message).toContain("Visita guiada");
    }
  });

  it("dos filas generales a la vez → aviso, aunque sean pausas", () => {
    const a = ses({ type: "PAUSA" });
    const b = ses({ type: "PAUSA", start: "10:30", end: "11:30" });
    expect(codes(run([a, b]))).toEqual(["GLOBAL_OVERLAP"]);
  });

  it("una fila general cancelada no genera avisos", () => {
    const visit = ses({ type: "SOCIAL", cancelled: true });
    const inRoom = ses({ roomId: "aula-17a" });
    expect(run([visit, inRoom])).toEqual([]);
  });
});

// ─── Horas y días ─────────────────────────────────────────────────────

describe("horas y días", () => {
  it("fin anterior o igual al inicio → error, y no participa en solapes", () => {
    const equal = ses({ roomId: "aula-17a", start: "10:00", end: "10:00" });
    const before = ses({ roomId: "aula-17a", start: "11:00", end: "10:15" });
    const ok = ses({ roomId: "aula-17a", start: "10:00", end: "11:00" });
    const issues = run([equal, before, ok]);
    expect(codes(issues)).toEqual(["END_NOT_AFTER_START", "END_NOT_AFTER_START"]);
    expect(issues.every((i) => i.severity === "error")).toBe(true);
  });

  it("horas mal formadas → un error por cada hora incorrecta", () => {
    const s = ses({ start: "9:30", end: "24:00" });
    const issues = run([s]);
    expect(codes(issues)).toEqual(["INVALID_TIME", "INVALID_TIME"]);
    expect(issues.map((i) => i.key)).toEqual([`INVALID_TIME:${s.id}:end`, `INVALID_TIME:${s.id}:start`].sort());
  });

  it("día que no está en la tabla Day → error", () => {
    const s = ses({ day: "2027-02-13" });
    const issues = run([s]);
    expect(codes(issues)).toEqual(["UNKNOWN_DAY"]);
    expect(issues[0].message).toContain("2027-02-13");
  });
});

// ─── Publicación y ponentes ───────────────────────────────────────────

describe("publicación y ponentes", () => {
  it("una sesión sin publicar → sugerencia", () => {
    const issues = run([ses({ published: false })]);
    expect(codes(issues)).toEqual(["UNPUBLISHED"]);
    expect(issues[0].severity).toBe("info");
  });

  it("ponencia, panel y mesa redonda sin ponentes → sugerencia", () => {
    const list = [
      ses({ type: "PONENCIA", roomId: "salon-actos", start: "09:00", end: "10:00" }),
      ses({ type: "PANEL_EXPERTOS", roomId: "salon-actos", start: "10:00", end: "11:00" }),
      ses({ type: "MESA_REDONDA", roomId: "salon-actos", start: "11:00", end: "12:00", speakers: " \n " }),
    ];
    const issues = run(list);
    expect(codes(issues)).toEqual(["MISSING_SPEAKERS", "MISSING_SPEAKERS", "MISSING_SPEAKERS"]);
    expect(issues.every((i) => i.severity === "info")).toBe(true);
  });

  it("con ponentes, o de otro tipo, no hay sugerencia", () => {
    const list = [
      ses({ type: "PONENCIA", roomId: "salon-actos", speakers: "Ana Pérez (USAL)" }),
      ses({ type: "TALLER", roomId: "aula-17a" }),
      ses({ type: "COMUNICACIONES", roomId: "aula-12a" }),
    ];
    expect(run(list)).toEqual([]);
  });
});

// ─── Salas y edificios ────────────────────────────────────────────────

describe("salas y edificios", () => {
  it("sala inactiva con sesiones → un aviso con todas sus sesiones", () => {
    const rooms = ROOMS.map((r) => (r.id === "aula-12a" ? { ...r, active: false } : r));
    const late = ses({ roomId: "aula-12a", start: "12:00", end: "13:00" });
    const early = ses({ roomId: "aula-12a", start: "09:00", end: "10:00" });
    const other = ses({ roomId: "aula-17a" });
    const issues = run([late, early, other], { rooms });
    expect(codes(issues)).toEqual(["INACTIVE_ROOM"]);
    expect(issues[0].roomId).toBe("aula-12a");
    expect(issues[0].day).toBeNull();
    expect(ids(issues[0])).toEqual([early.id, late.id]);
    expect(issues[0].message).toContain("2 sesiones");
  });

  it("sala o edificio inexistente → error", () => {
    const a = ses({ roomId: "aula-fantasma" });
    const b = ses({ venueId: "edificio-fantasma" });
    expect(codes(run([a, b]))).toEqual(["UNKNOWN_ROOM", "UNKNOWN_VENUE"]);
  });

  it("sala que no pertenece al edificio indicado → aviso", () => {
    const s = ses({ roomId: "aula-17a", venueId: "facultad" });
    const issues = run([s]);
    expect(codes(issues)).toEqual(["ROOM_VENUE_MISMATCH"]);
    expect(issues[0].severity).toBe("warning");
  });

  it("una sesión de sala con el edificio correcto no avisa", () => {
    expect(run([ses({ roomId: "aula-17a", venueId: "iuce" })])).toEqual([]);
  });
});

// ─── Orden y recuento ─────────────────────────────────────────────────

describe("orden y recuento", () => {
  it("ordena por gravedad (errores, avisos, sugerencias) y luego por día y hora", () => {
    const draft = ses({ published: false, day: "2027-02-11", start: "08:00", end: "08:30" });
    const whole = ses({ venueId: "iuce", day: "2027-02-12" });
    const inRoom = ses({ roomId: "aula-17a", day: "2027-02-12" });
    const clashA = ses({ roomId: "salon-actos", day: "2027-02-12", start: "12:00", end: "13:00" });
    const clashB = ses({ roomId: "salon-actos", day: "2027-02-12", start: "12:30", end: "13:30" });
    const badDay = ses({ day: "2027-02-10" });
    const issues = run([draft, whole, inRoom, clashA, clashB, badDay]);
    expect(codes(issues)).toEqual(["UNKNOWN_DAY", "ROOM_OVERLAP", "VENUE_OVERLAP", "UNPUBLISHED"]);
    expect(countIssues(issues)).toEqual({ error: 2, warning: 1, info: 1 });
  });

  it("las claves son únicas", () => {
    const list = [
      ses({ roomId: "aula-17a", published: false, type: "PONENCIA" }),
      ses({ roomId: "aula-17a", published: false, type: "PONENCIA" }),
      ses({ venueId: "iuce", start: "10:30", end: "10:45" }),
      ses({ type: "SOCIAL", start: "10:15", end: "10:20" }),
    ];
    const issues = run(list);
    expect(issues.length).toBeGreaterThan(5);
    expect(new Set(issues.map((i) => i.key)).size).toBe(issues.length);
  });

  it("un programa vacío no tiene avisos", () => {
    expect(run([])).toEqual([]);
  });
});
