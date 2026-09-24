import { adminRoute, ok, readJson } from "@/lib/admin/http";
import { passwordResetSchema } from "@/lib/admin/schemas";
import { resetPassword } from "@/lib/admin/users";

/** PUT: restablece la contraseña de una cuenta (solo ADMIN; bcrypt coste 12). */
export const PUT = adminRoute<{ id: string }>(
  async (req, { params }) => {
    const { password } = await readJson(req, passwordResetSchema);
    const user = await resetPassword(params.id, password);
    return ok({ user });
  },
  { role: "ADMIN" },
);
