import { adminRoute } from "@/lib/admin/http";
import { buildProgrammeExport, exportFileName } from "@/lib/admin/export";

/** GET: descarga el programa completo en JSON (edificios, salas, días, sesiones, ajustes). */
export const GET = adminRoute(async (_req, { user }) => {
  const data = await buildProgrammeExport(user);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFileName()}"`,
      "Cache-Control": "no-store",
    },
  });
});
