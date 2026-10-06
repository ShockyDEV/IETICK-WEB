import { adminRoute, ok, readJson, revalidatePublic } from "@/lib/admin/http";
import { settingsSchema } from "@/lib/admin/schemas";
import { getProgrammeStatus, setProgrammeStatus } from "@/lib/admin/settings";

/** GET: ajustes del programa. */
export const GET = adminRoute(async () => ok({ programmeStatus: await getProgrammeStatus() }));

/** PUT: { programmeStatus: "provisional" | "definitivo" }. */
export const PUT = adminRoute(async (req) => {
  const { programmeStatus } = await readJson(req, settingsSchema);
  const status = await setProgrammeStatus(programmeStatus);
  revalidatePublic();
  return ok({ programmeStatus: status });
});
