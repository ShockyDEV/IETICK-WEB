/**
 * `npm run programa:publicar`: guarda el programa de la base de datos local
 * (lo editado en el panel) en prisma/programa-publicado.json.
 *
 * Al subir ese fichero a GitHub, la web estática se regenera con él en unos
 * minutos. El fichero solo cambia si cambia el programa.
 */
import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { readProgrammeSnapshot, SNAPSHOT_FILE } from "../src/lib/programme-snapshot";

const prisma = new PrismaClient();

async function main() {
  const snapshot = await readProgrammeSnapshot(prisma);
  writeFileSync(SNAPSHOT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`);
  const published = snapshot.sessions.filter((s) => s.published).length;
  console.log(
    `Programa guardado en ${SNAPSHOT_FILE}: ${snapshot.sessions.length} sesiones (${published} publicadas), ` +
      `${snapshot.rooms.length} salas y ${snapshot.days.length} días.\n` +
      "Súbelo a GitHub (git add, commit y push) y la web se regenerará en unos minutos.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
