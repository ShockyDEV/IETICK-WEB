import { adminRoute, ok, readJson, revalidatePublic } from "@/lib/admin/http";
import { roomInputSchema, roomPatchSchema } from "@/lib/admin/schemas";
import { deleteRoom, setRoomActive, updateRoom } from "@/lib/admin/spaces";

/** PUT: actualiza la sala (el id no cambia). */
export const PUT = adminRoute<{ id: string }>(async (req, { params }) => {
  const input = await readJson(req, roomInputSchema);
  const room = await updateRoom(params.id, input);
  revalidatePublic();
  return ok({ room });
});

/** PATCH: activar / desactivar. */
export const PATCH = adminRoute<{ id: string }>(async (req, { params }) => {
  const { active } = await readJson(req, roomPatchSchema);
  const room = await setRoomActive(params.id, active);
  revalidatePublic();
  return ok({ room });
});

/** DELETE: solo si no tiene sesiones (409 si las tiene: mejor desactivarla). */
export const DELETE = adminRoute<{ id: string }>(async (_req, { params }) => {
  await deleteRoom(params.id);
  revalidatePublic();
  return ok({ deleted: params.id });
});
