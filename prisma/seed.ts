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
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import {
  SEED_DAYS,
  SEED_ROOMS,
  SEED_SESSIONS,
  SEED_SETTINGS,
  SEED_VENUES,
} from "../src/content/programme-seed";

const prisma = new PrismaClient();

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

  // ─── Edificios y salas ──────────────────────────────────────────────
  for (const v of SEED_VENUES) {
    await prisma.venue.upsert({ where: { id: v.id }, update: {}, create: v });
  }
  for (const r of SEED_ROOMS) {
    await prisma.room.upsert({ where: { id: r.id }, update: {}, create: r });
  }
  console.log(`Edificios: ${SEED_VENUES.length} · Salas: ${SEED_ROOMS.length}`);

  // ─── Días y ajustes ─────────────────────────────────────────────────
  for (const d of SEED_DAYS) {
    await prisma.day.upsert({ where: { key: d.key }, update: {}, create: d });
  }
  for (const s of SEED_SETTINGS) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  // ─── Sesiones ───────────────────────────────────────────────────────
  if (process.env.SEED_RESET === "1") {
    await prisma.session.deleteMany();
    console.log("SEED_RESET=1: sesiones borradas");
  }
  const count = await prisma.session.count();
  if (count === 0) {
    let order = 0;
    for (const s of SEED_SESSIONS) {
      await prisma.session.create({ data: { ...s, order: order++ } });
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
