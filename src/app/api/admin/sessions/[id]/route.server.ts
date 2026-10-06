import { HttpError } from "@/lib/admin/errors";
import { adminRoute, ok, readJson, revalidatePublic } from "@/lib/admin/http";
import { sessionFlagsSchema, sessionInputSchema } from "@/lib/admin/schemas";
import { deleteSession, getSessionData, setSessionFlags, updateSession } from "@/lib/admin/sessions";

/** GET: sesión completa con sus contribuciones. */
export const GET = adminRoute<{ id: string }>(async (_req, { params }) => {
  const session = await getSessionData(params.id);
  if (!session) throw new HttpError(404, "La sesión no existe.");
  return ok({ session });
});

/** PUT: guarda la sesión completa (y sincroniza sus contribuciones). */
export const PUT = adminRoute<{ id: string }>(async (req, { params }) => {
  const input = await readJson(req, sessionInputSchema);
  const session = await updateSession(params.id, input);
  revalidatePublic();
  return ok({ session });
});

/** PATCH: publicar / despublicar / cancelar. */
export const PATCH = adminRoute<{ id: string }>(async (req, { params }) => {
  const flags = await readJson(req, sessionFlagsSchema);
  const session = await setSessionFlags(params.id, flags);
  revalidatePublic();
  return ok({ session });
});

/** DELETE: borra la sesión y sus contribuciones. */
export const DELETE = adminRoute<{ id: string }>(async (_req, { params }) => {
  const result = await deleteSession(params.id);
  revalidatePublic();
  return ok({ deleted: result });
});
