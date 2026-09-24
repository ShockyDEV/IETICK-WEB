import { adminRoute, ok, readJson } from "@/lib/admin/http";
import { userCreateSchema } from "@/lib/admin/schemas";
import { createUser, listUsers } from "@/lib/admin/users";

/** GET: cuentas del panel (solo ADMIN). */
export const GET = adminRoute(async () => ok({ users: await listUsers() }), { role: "ADMIN" });

/** POST: crea una cuenta EDITOR o ADMIN con contraseña inicial (solo ADMIN). */
export const POST = adminRoute(
  async (req) => {
    const input = await readJson(req, userCreateSchema);
    const user = await createUser(input);
    return ok({ user }, 201);
  },
  { role: "ADMIN" },
);
