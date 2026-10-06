import { adminRoute, ok, revalidatePublic } from "@/lib/admin/http";
import { duplicateSession } from "@/lib/admin/sessions";

/** POST: duplica la sesión (y sus contribuciones) como borrador. */
export const POST = adminRoute<{ id: string }>(async (_req, { params }) => {
  const session = await duplicateSession(params.id);
  revalidatePublic();
  return ok({ session }, 201);
});
