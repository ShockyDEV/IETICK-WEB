import "server-only";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/admin/errors";
import { plural } from "@/lib/admin/format";
import type { DayCreateInput, DayUpdateInput } from "@/lib/admin/schemas";
import type { DayRow, ProgrammeStatus } from "@/lib/admin/types";

/**
 * Ajustes del programa: estado (provisional / definitivo) y días del
 * congreso. La clave de un día ("2027-02-11") no se edita: las sesiones la
 * guardan como texto.
 */

export const PROGRAMME_STATUS_KEY = "programmeStatus";

export async function getProgrammeStatus(): Promise<ProgrammeStatus> {
  const row = await prisma.setting.findUnique({ where: { key: PROGRAMME_STATUS_KEY } });
  return row?.value === "definitivo" ? "definitivo" : "provisional";
}

export async function setProgrammeStatus(status: ProgrammeStatus): Promise<ProgrammeStatus> {
  await prisma.setting.upsert({
    where: { key: PROGRAMME_STATUS_KEY },
    update: { value: status },
    create: { key: PROGRAMME_STATUS_KEY, value: status },
  });
  return status;
}

// ─── Días ─────────────────────────────────────────────────────────────

async function sessionsPerDay(): Promise<Map<string, number>> {
  const groups = await prisma.session.groupBy({ by: ["day"], _count: { _all: true } });
  return new Map(groups.map((g) => [g.day, g._count._all]));
}

export async function listDays(): Promise<DayRow[]> {
  const [days, counts] = await Promise.all([
    prisma.day.findMany({ orderBy: [{ order: "asc" }, { key: "asc" }] }),
    sessionsPerDay(),
  ]);
  return days.map((d) => ({
    key: d.key,
    labelEs: d.labelEs,
    labelPt: d.labelPt,
    order: d.order,
    sessionsCount: counts.get(d.key) ?? 0,
  }));
}

export async function createDay(input: DayCreateInput): Promise<DayRow> {
  const exists = await prisma.day.findUnique({ where: { key: input.key }, select: { key: true } });
  if (exists) {
    throw new HttpError(409, "Ese día ya existe.", [{ path: "key", message: "Ese día ya está en la lista." }]);
  }
  const day = await prisma.day.create({ data: input });
  const sessionsCount = await prisma.session.count({ where: { day: day.key } });
  return { key: day.key, labelEs: day.labelEs, labelPt: day.labelPt, order: day.order, sessionsCount };
}

export async function updateDay(key: string, input: DayUpdateInput): Promise<DayRow> {
  const exists = await prisma.day.findUnique({ where: { key }, select: { key: true } });
  if (!exists) throw new HttpError(404, "El día no existe (puede que se haya borrado).");
  const day = await prisma.day.update({ where: { key }, data: input });
  const sessionsCount = await prisma.session.count({ where: { day: key } });
  return { key: day.key, labelEs: day.labelEs, labelPt: day.labelPt, order: day.order, sessionsCount };
}

export async function deleteDay(key: string): Promise<void> {
  const day = await prisma.day.findUnique({ where: { key }, select: { labelEs: true } });
  if (!day) throw new HttpError(404, "El día no existe (puede que ya se haya borrado).");
  const n = await prisma.session.count({ where: { day: key } });
  if (n > 0) {
    throw new HttpError(
      409,
      `No se puede borrar «${day.labelEs}»: tiene ${plural(n, "sesión", "sesiones")}. Muévelas a otro día o bórralas antes.`,
    );
  }
  await prisma.day.delete({ where: { key } });
}
