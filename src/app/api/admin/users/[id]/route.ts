import { adminRoute, ok, readJson } from "@/lib/admin/http";
import { userUpdateSchema } from "@/lib/admin/schemas";
import { updateUser } from "@/lib/admin/users";

/** PATCH: nombre, rol o activa/desactivada (solo ADMIN; con salvaguardas). */
export const PATCH = adminRoute<{ id: string }>(
  async (req, { params, user }) => {
    const input = await readJson(req, userUpdateSchema);
    const updated = await updateUser(user, params.id, input);
    return ok({ user: updated });
  },
  { role: "ADMIN" },
);
