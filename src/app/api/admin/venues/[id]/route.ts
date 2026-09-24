import { adminRoute, ok, readJson, revalidatePublic } from "@/lib/admin/http";
import { venueInputSchema } from "@/lib/admin/schemas";
import { deleteVenue, updateVenue } from "@/lib/admin/spaces";

/** PUT: actualiza el edificio (el id no cambia). */
export const PUT = adminRoute<{ id: string }>(async (req, { params }) => {
  const input = await readJson(req, venueInputSchema);
  const venue = await updateVenue(params.id, input);
  revalidatePublic();
  return ok({ venue });
});

/** DELETE: solo si no tiene salas ni sesiones de edificio (409 si las tiene). */
export const DELETE = adminRoute<{ id: string }>(async (_req, { params }) => {
  await deleteVenue(params.id);
  revalidatePublic();
  return ok({ deleted: params.id });
});
