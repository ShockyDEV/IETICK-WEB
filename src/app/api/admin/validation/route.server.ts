import { countIssues } from "@/lib/programme-validate";
import { adminRoute, ok } from "@/lib/admin/http";
import { getProgrammeIssues } from "@/lib/admin/overview";

/** GET: avisos de validación del programa (ver src/lib/programme-validate.ts). */
export const GET = adminRoute(async () => {
  const issues = await getProgrammeIssues();
  return ok({ counts: countIssues(issues), issues });
});
