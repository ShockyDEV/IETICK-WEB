import { adminRoute, ok, readJson, revalidatePublic } from "@/lib/admin/http";
import { venueInputSchema } from "@/lib/admin/schemas";
import { createVenue, listVenuesWithRooms } from "@/lib/admin/spaces";

/** GET: edificios con sus salas (y recuentos de sesiones). */
export const GET = adminRoute(async () => ok({ venues: await listVenuesWithRooms() }));

/** POST: crea un edificio; el id (slug) se genera del nombre. */
export const POST = adminRoute(async (req) => {
  const input = await readJson(req, venueInputSchema);
  const venue = await createVenue(input);
  revalidatePublic();
  return ok({ venue }, 201);
});
