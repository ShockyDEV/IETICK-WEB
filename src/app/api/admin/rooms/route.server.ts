import { adminRoute, ok, readJson, revalidatePublic } from "@/lib/admin/http";
import { roomInputSchema } from "@/lib/admin/schemas";
import { createRoom, listVenuesWithRooms } from "@/lib/admin/spaces";

/** GET: todas las salas (incluidas las inactivas). */
export const GET = adminRoute(async () => {
  const venues = await listVenuesWithRooms();
  return ok({ rooms: venues.flatMap((v) => v.rooms) });
});

/** POST: crea una sala; el id (slug) se genera del nombre. */
export const POST = adminRoute(async (req) => {
  const input = await readJson(req, roomInputSchema);
  const room = await createRoom(input);
  revalidatePublic();
  return ok({ room }, 201);
});
