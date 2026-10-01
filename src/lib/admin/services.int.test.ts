/**
 * Pruebas de integración del panel /backstage contra PostgreSQL.
 * Ejercitan los servicios que usan los route handlers de /api/admin/**
 * (la capa HTTP solo añade sesión, rol, anti-CSRF y validación zod).
 *
 *   npm run test:int      (BD «ietic27_test»; ver src/test/integration-setup.ts)
 */
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/admin/errors";
import { sessionInputSchema, type SessionPayload } from "@/lib/admin/schemas";
import {
  createSession,
  deleteSession,
  duplicateSession,
  getSessionData,
  listSessionRows,
  setSessionFlags,
  updateSession,
} from "@/lib/admin/sessions";
import { createRoom, createVenue, deleteRoom, deleteVenue, listVenuesWithRooms, setRoomActive } from "@/lib/admin/spaces";
import { createDay, deleteDay, getProgrammeStatus, listDays, setProgrammeStatus } from "@/lib/admin/settings";
import { createUser, resetPassword, updateUser } from "@/lib/admin/users";
import { buildProgrammeExport } from "@/lib/admin/export";
import { getProgrammeIssues } from "@/lib/admin/overview";
import { getProgramme } from "@/lib/programme";
import { SEED_DAYS, SEED_ROOMS, SEED_SESSIONS, SEED_SETTINGS, SEED_VENUES, seedSessionData } from "@/content/programme-seed";
import type { AdminUser } from "@/lib/admin/guard";

// ─── Utilidades ───────────────────────────────────────────────────────

async function resetDb() {
  await prisma.talk.deleteMany();
  await prisma.session.deleteMany();
  await prisma.room.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.day.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();
}

/** Carga la semilla real (edificios, salas, días, programa provisional). */
async function loadSeed() {
  await prisma.venue.createMany({ data: SEED_VENUES });
  await prisma.room.createMany({ data: SEED_ROOMS });
  await prisma.day.createMany({ data: SEED_DAYS });
  await prisma.setting.createMany({ data: SEED_SETTINGS });
  let order = 0;
  for (const s of SEED_SESSIONS) await prisma.session.create({ data: seedSessionData(s, order++) });
}

/** Normaliza un payload del formulario como hace el route handler. */
const input = (payload: Partial<SessionPayload>) =>
  sessionInputSchema.parse({
    day: "2027-02-11",
    start: "16:00",
    end: "17:00",
    type: "TALLER",
    title: "Taller de prueba",
    ...payload,
  });

async function expectHttp(promise: Promise<unknown>, status: number, path?: string) {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(HttpError);
  expect((error as HttpError).status).toBe(status);
  if (path) expect((error as HttpError).issues.map((i) => i.path)).toContain(path);
}

beforeEach(async () => {
  await resetDb();
  await loadSeed();
});

afterAll(async () => {
  await resetDb();
  await prisma.$disconnect();
});

// ─── Sesiones ─────────────────────────────────────────────────────────

describe("sesiones", () => {
  it("crea una sesión con contribuciones ordenadas y orden automático", async () => {
    const s = await createSession(
      input({
        roomId: "aula-17a",
        talks: [
          { title: "Primera", authors: "A. Autora", axis: "rea" },
          { title: "Segunda", presenter: "B. Ponente" },
        ],
      }),
    );
    expect(s.roomId).toBe("aula-17a");
    expect(s.talks.map((t) => [t.order, t.title])).toEqual([
      [0, "Primera"],
      [1, "Segunda"],
    ]);
    expect(s.order).toBe(SEED_SESSIONS.length); // tras las 15 de la semilla
  });

  it("con sala, el edificio se deduce: venueId se guarda vacío", async () => {
    const s = await createSession(input({ roomId: "aula-12a", venueId: "solis" }));
    expect(s.roomId).toBe("aula-12a");
    expect(s.venueId).toBeNull();
  });

  it("rechaza días, salas y edificios inexistentes señalando el campo", async () => {
    await expectHttp(createSession(input({ day: "2027-02-13" })), 400, "day");
    await expectHttp(createSession(input({ roomId: "no-existe" })), 400, "roomId");
    await expectHttp(createSession(input({ venueId: "no-existe" })), 400, "venueId");
  });

  it("al editar sincroniza las contribuciones: conserva ids, crea, borra y reordena", async () => {
    const s = await createSession(input({ talks: [{ title: "A" }, { title: "B" }, { title: "C" }] }));
    const [a, b, c] = s.talks;
    const updated = await updateSession(
      s.id,
      input({ title: "Editada", talks: [{ id: c.id, title: "C'" }, { title: "Nueva" }, { id: a.id, title: "A" }] }),
    );
    expect(updated.title).toBe("Editada");
    expect(updated.talks.map((t) => t.title)).toEqual(["C'", "Nueva", "A"]);
    expect(updated.talks[0].id).toBe(c.id);
    expect(updated.talks[2].id).toBe(a.id);
    expect(await prisma.talk.findUnique({ where: { id: b.id } })).toBeNull();
  });

  it("no roba contribuciones de otra sesión aunque se envíe su id", async () => {
    const other = await createSession(input({ title: "Otra", talks: [{ title: "Ajena" }] }));
    const mine = await createSession(input({ title: "Mía" }));
    const updated = await updateSession(mine.id, input({ title: "Mía", talks: [{ id: other.talks[0].id, title: "Copia" }] }));
    expect(updated.talks[0].id).not.toBe(other.talks[0].id);
    expect((await getSessionData(other.id))?.talks.map((t) => t.title)).toEqual(["Ajena"]);
  });

  it("publica, despublica y cancela sin tocar el resto", async () => {
    const s = await createSession(input({}));
    const off = await setSessionFlags(s.id, { published: false });
    expect(off.published).toBe(false);
    const cancelled = await setSessionFlags(s.id, { cancelled: true });
    expect(cancelled).toMatchObject({ published: false, cancelled: true, title: s.title });
  });

  it("duplica como borrador, con sus contribuciones", async () => {
    const s = await createSession(input({ roomId: "aula-12a", talks: [{ title: "T1" }, { title: "T2" }] }));
    const copy = await duplicateSession(s.id);
    expect(copy.id).not.toBe(s.id);
    expect(copy.title).toBe("Taller de prueba (copia)");
    expect(copy.published).toBe(false);
    expect(copy.roomId).toBe("aula-12a");
    expect(copy.talks.map((t) => t.title)).toEqual(["T1", "T2"]);
  });

  it("borra la sesión y sus contribuciones en cascada", async () => {
    const s = await createSession(input({ talks: [{ title: "T" }] }));
    expect(await deleteSession(s.id)).toEqual({ id: s.id, talks: 1 });
    expect(await prisma.talk.count({ where: { sessionId: s.id } })).toBe(0);
    await expectHttp(deleteSession(s.id), 404);
  });

  it("el listado describe la ubicación de cada sesión", async () => {
    const rows = await listSessionRows();
    expect(rows).toHaveLength(SEED_SESSIONS.length);
    const talleres = rows.find((r) => r.title === "Talleres");
    expect(talleres?.venueId).toBe("solis");
    expect(talleres?.locationLabel).toMatch(/Edificio Solís/);
  });
});

// ─── Web pública ──────────────────────────────────────────────────────

describe("programa público", () => {
  it("solo muestra sesiones publicadas y salas activas", async () => {
    const draft = await createSession(input({ title: "Borrador", published: false }));
    await setRoomActive("aula-12a", false);
    const data = await getProgramme();
    expect(data.status).toBe("provisional");
    expect(data.sessions.some((s) => s.id === draft.id)).toBe(false);
    expect(data.sessions).toHaveLength(SEED_SESSIONS.length);
    // el Laboratorio ya viene inactivo en la semilla
    expect(data.rooms.map((r) => r.id)).toEqual(["salon-actos", "aula-17a", "sala-usos-multiples"]);
  });

  it("el estado provisional/definitivo se guarda en Ajustes", async () => {
    expect(await getProgrammeStatus()).toBe("provisional");
    await setProgrammeStatus("definitivo");
    expect(await getProgrammeStatus()).toBe("definitivo");
    expect((await getProgramme()).status).toBe("definitivo");
  });
});

// ─── Validación del programa provisional real ─────────────────────────

describe("validación", () => {
  it("el programa provisional no tiene errores; solo avisa de ponentes pendientes", async () => {
    const issues = await getProgrammeIssues();
    expect(issues.filter((i) => i.severity === "error")).toEqual([]);
    const missing = issues.filter((i) => i.code === "MISSING_SPEAKERS");
    // La ponencia invitada del viernes y el panel de expertos (la mesa redonda
    // lleva sus personas en las experiencias)
    expect(missing).toHaveLength(2);
  });

  it("detecta el solape de dos sesiones en la misma sala", async () => {
    await createSession(input({ roomId: "salon-actos", start: "10:30", end: "11:00", type: "OTRO", title: "Solapa" }));
    const issues = await getProgrammeIssues();
    expect(issues.some((i) => i.code === "ROOM_OVERLAP" && i.roomId === "salon-actos")).toBe(true);
  });

  it("detecta una sesión de aula que pisa los talleres simultáneos del IUCE", async () => {
    await createSession(input({ roomId: "aula-17a", start: "16:00", end: "16:30", type: "OTRO", title: "Pisa talleres" }));
    const issues = await getProgrammeIssues();
    expect(issues.some((i) => i.code === "VENUE_OVERLAP")).toBe(true);
  });
});

// ─── Espacios ─────────────────────────────────────────────────────────

describe("espacios", () => {
  it("genera ids estables a partir del nombre, sin tildes y sin repetir", async () => {
    const v = await createVenue({ name: "Aulario Unamuno", namePt: null, short: null, subtitle: null, subtitlePt: null, address: null, order: 5 });
    expect(v.id).toBe("aulario-unamuno");
    const roomInput = {
      venueId: v.id, name: "Salón de Grados", namePt: null, code: null, capacity: 80, floor: null, floorPt: null,
      description: null, descriptionPt: null, equipment: ["Proyector"], imageUrl: null, accessible: true, order: 0, active: true,
    };
    const room = await createRoom(roomInput);
    expect(room.id).toBe("salon-de-grados");
    expect(room.equipment).toEqual(["Proyector"]);
    const again = await createRoom(roomInput);
    expect(again.id).toBe("salon-de-grados-2");
  });

  it("no borra un edificio con salas ni una sala con sesiones", async () => {
    await expectHttp(deleteVenue("solis"), 409);
    await expectHttp(deleteRoom("salon-actos"), 409);
    // Una sala sin sesiones sí se puede borrar
    await deleteRoom("sala-usos-multiples");
    const venues = await listVenuesWithRooms();
    expect(venues.flatMap((v) => v.rooms.map((r) => r.id))).not.toContain("sala-usos-multiples");
  });

  it("rechaza salas en edificios inexistentes", async () => {
    await expectHttp(
      createRoom({
        venueId: "no-existe", name: "X", namePt: null, code: null, capacity: null, floor: null, floorPt: null,
        description: null, descriptionPt: null, equipment: [], imageUrl: null, accessible: true, order: 0, active: true,
      }),
      400,
      "venueId",
    );
  });
});

// ─── Días ─────────────────────────────────────────────────────────────

describe("días", () => {
  it("no duplica días ni borra un día con sesiones", async () => {
    await expectHttp(createDay({ key: "2027-02-11", labelEs: "x", labelPt: "x", order: 0 }), 409, "key");
    await expectHttp(deleteDay("2027-02-11"), 409);
    await createDay({ key: "2027-02-10", labelEs: "Miércoles 10 de febrero", labelPt: "Quarta-feira, 10 de fevereiro", order: -1 });
    const days = await listDays();
    expect(days[0]).toMatchObject({ key: "2027-02-10", sessionsCount: 0 });
    await deleteDay("2027-02-10");
    expect((await listDays()).map((d) => d.key)).toEqual(["2027-02-11", "2027-02-12"]);
  });
});

// ─── Cuentas ──────────────────────────────────────────────────────────

describe("cuentas", () => {
  async function admin(email: string): Promise<AdminUser> {
    const u = await createUser({ email, name: null, role: "ADMIN", password: "contrasena-larga-1" });
    return { id: u.id, email: u.email, name: u.name, role: u.role };
  }

  it("no permite correos repetidos", async () => {
    await admin("a@ietic27.local");
    await expectHttp(createUser({ email: "a@ietic27.local", name: null, role: "EDITOR", password: "contrasena-larga-2" }), 409, "email");
  });

  it("nadie puede desactivarse ni quitarse el rol de administración a sí mismo", async () => {
    const a = await admin("a@ietic27.local");
    await expectHttp(updateUser(a, a.id, { active: false }), 409);
    await expectHttp(updateUser(a, a.id, { role: "EDITOR" }), 409);
  });

  it("siempre queda al menos un administrador activo", async () => {
    const a = await admin("a@ietic27.local");
    const b = await admin("b@ietic27.local");
    await updateUser(a, b.id, { active: false }); // queda A
    const editor = await createUser({ email: "e@ietic27.local", name: null, role: "EDITOR", password: "contrasena-larga-3" });
    const e: AdminUser = { id: editor.id, email: editor.email, name: null, role: "EDITOR" };
    await expectHttp(updateUser(e, a.id, { active: false }), 409);
    await expectHttp(updateUser(e, a.id, { role: "EDITOR" }), 409);
  });

  it("restablece la contraseña con bcrypt", async () => {
    const a = await admin("a@ietic27.local");
    await resetPassword(a.id, "otra-contrasena-segura");
    const row = await prisma.user.findUniqueOrThrow({ where: { id: a.id } });
    expect(await bcrypt.compare("otra-contrasena-segura", row.passwordHash)).toBe(true);
    expect(await bcrypt.compare("contrasena-larga-1", row.passwordHash)).toBe(false);
  });
});

// ─── Exportación ──────────────────────────────────────────────────────

describe("exportación", () => {
  it("exporta todo el programa (sin cuentas de usuario)", async () => {
    const who: AdminUser = { id: "x", email: "admin@ietic27.local", name: null, role: "ADMIN" };
    const out = await buildProgrammeExport(who);
    expect(out.counts).toMatchObject({ venues: 1, rooms: 5, days: 2, sessions: SEED_SESSIONS.length });
    expect(out.settings.programmeStatus).toBe("provisional");
    expect(JSON.stringify(out)).not.toMatch(/passwordHash/);
  });
});
