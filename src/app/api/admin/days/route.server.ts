import { adminRoute, ok, readJson, revalidatePublic } from "@/lib/admin/http";
import { dayCreateSchema } from "@/lib/admin/schemas";
import { createDay, listDays } from "@/lib/admin/settings";

/** GET: días del congreso con su número de sesiones. */
export const GET = adminRoute(async () => ok({ days: await listDays() }));

/** POST: añade un día (clave AAAA-MM-DD). */
export const POST = adminRoute(async (req) => {
  const input = await readJson(req, dayCreateSchema);
  const day = await createDay(input);
  revalidatePublic();
  return ok({ day }, 201);
});
