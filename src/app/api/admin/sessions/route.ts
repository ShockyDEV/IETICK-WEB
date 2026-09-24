import { adminRoute, ok, readJson, revalidatePublic } from "@/lib/admin/http";
import { sessionInputSchema } from "@/lib/admin/schemas";
import { createSession, listSessionRows } from "@/lib/admin/sessions";

/** GET: listado del programa (todas las sesiones, incluidos borradores). */
export const GET = adminRoute(async () => ok({ sessions: await listSessionRows() }));

/** POST: crea una sesión (con sus contribuciones). */
export const POST = adminRoute(async (req) => {
  const input = await readJson(req, sessionInputSchema);
  const session = await createSession(input);
  revalidatePublic();
  return ok({ session }, 201);
});
