import { HttpError } from "@/lib/admin/errors";
import { adminRoute, ok, readJson, revalidatePublic } from "@/lib/admin/http";
import { DAY_KEY_PATTERN, dayUpdateSchema } from "@/lib/admin/schemas";
import { deleteDay, updateDay } from "@/lib/admin/settings";

/** La clave del día viene en la URL: "2027-02-11". */
function dayKey(key: string): string {
  if (!DAY_KEY_PATTERN.test(key)) throw new HttpError(404, "El día no existe.");
  return key;
}

/** PUT: cambia las etiquetas ES/PT y el orden (la clave no se edita). */
export const PUT = adminRoute<{ key: string }>(async (req, { params }) => {
  const input = await readJson(req, dayUpdateSchema);
  const day = await updateDay(dayKey(params.key), input);
  revalidatePublic();
  return ok({ day });
});

/** DELETE: solo si el día no tiene sesiones (409 si las tiene). */
export const DELETE = adminRoute<{ key: string }>(async (_req, { params }) => {
  const key = dayKey(params.key);
  await deleteDay(key);
  revalidatePublic();
  return ok({ deleted: key });
});
