/**
 * Semilla de la base de datos de ieTIC 2027.
 *
 *   npm run db:seed              → crea lo que falte (idempotente)
 *   SEED_RESET=1 npm run db:seed → además BORRA y recrea las sesiones
 *                                   (pierde lo editado en el panel)
 *
 * Edificios, salas, días y ajustes se actualizan con upsert, pero las
 * sesiones solo se crean si la tabla está vacía: así una segunda ejecución
 * no pisa el programa editado desde /backstage.
 *
 * Si existe prisma/programa-publicado.json (`npm run programa:publicar`), el
 * programa sale de ahí; si no, del programa provisional de programme-seed.ts.
 * Es lo que hace la compilación de la web estática en GitHub.
 */
import { existsSync, readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import {
  SEED_DAYS,
  SEED_ROOMS,
  SEED_SESSIONS,
  seedSessionData,
  SEED_SETTINGS,
  SEED_VENUES,
} from "../src/content/programme-seed";
import { assertSnapshot, SNAPSHOT_FILE, type ProgrammeSnapshot } from "../src/lib/programme-snapshot";

const prisma = new PrismaClient();

function readSnapshot(): ProgrammeSnapshot | null {
  if (!existsSync(SNAPSHOT_FILE)) return null;
  const data: unknown = JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8"));
  assertSnapshot(data);
  return data;
}

async function main() {
  // ─── Cuenta del panel ───────────────────────────────────────────────
  const email = (process.env.ADMIN_EMAIL || "admin@ietic27.local").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    if (!password) throw new Error("Falta ADMIN_PASSWORD en el entorno para crear la cuenta inicial.");
    await prisma.user.create({
      data: {
        email,
        name: "Administración ieTIC 2027",
        passwordHash: await bcrypt.hash(password, 12),
        role: "ADMIN",
      },
    });
    console.log(`Cuenta de administración creada: ${email}`);
  } else {
    await prisma.user.update({ where: { email }, data: { role: "ADMIN", active: true } });
    console.log(`Cuenta de administración ya existente: ${email} (contraseña sin cambios)`);
  }

  const snapshot = readSnapshot();
  console.log(`Programa: ${snapshot ? SNAPSHOT_FILE : "provisional (programme-seed.ts)"}`);
  const venues = snapshot ? snapshot.venues : SEED_VENUES;
  const rooms = snapshot ? snapshot.rooms : SEED_ROOMS;
  const days = snapshot ? snapshot.days : SEED_DAYS;
  const settings = snapshot
    ? Object.entries(snapshot.settings).map(([key, value]) => ({ key, value }))
    : SEED_SETTINGS;

  // ─── Edificios y salas ──────────────────────────────────────────────
  for (const v of venues) {
    await prisma.venue.upsert({ where: { id: v.id }, update: {}, create: v });
  }
  for (const r of rooms) {
    await prisma.room.upsert({ where: { id: r.id }, update: {}, create: r });
  }
  console.log(`Edificios: ${venues.length} · Salas: ${rooms.length}`);

  // ─── Días y ajustes ─────────────────────────────────────────────────
  for (const d of days) {
    await prisma.day.upsert({ where: { key: d.key }, update: {}, create: d });
  }
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  // ─── Sesiones ───────────────────────────────────────────────────────
  if (process.env.SEED_RESET === "1") {
    await prisma.session.deleteMany();
    console.log("SEED_RESET=1: sesiones borradas");
  }
  const count = await prisma.session.count();
  if (count === 0 && snapshot) {
    // Con sus id y sus fechas, tal y como estaban en el panel
    for (const { talks, ...s } of snapshot.sessions) {
      await prisma.session.create({ data: { ...s, talks: { create: talks } } });
    }
    console.log(`Sesiones creadas: ${snapshot.sessions.length} (${SNAPSHOT_FILE})`);
  } else if (count === 0) {
    let order = 0;
    for (const s of SEED_SESSIONS) {
      await prisma.session.create({ data: seedSessionData(s, order++) });
    }
    console.log(`Sesiones creadas: ${SEED_SESSIONS.length} (programa provisional)`);
  } else {
    console.log(`Sesiones ya existentes: ${count} (no se tocan)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
