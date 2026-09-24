import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin/guard";
import { getProgrammeOptions } from "@/lib/admin/spaces";
import { TIME_PATTERN } from "@/lib/programme-validate";
import { SESSION_TYPES, type SessionTypeKey } from "@/lib/session-types";
import { PageHeader } from "@/components/admin/bits";
import { SessionForm, type SessionPrefill } from "@/components/admin/SessionForm";

export const metadata: Metadata = { title: "Nueva sesión" };

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Nueva sesión. Admite ?day=AAAA-MM-DD&start=HH:MM&end=HH:MM&tipo=TALLER para rellenar el formulario. */
export default async function NewSessionPage({ searchParams }: Props) {
  await requireAdminPage();
  const [params, options] = await Promise.all([searchParams, getProgrammeOptions()]);
  const first = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const prefill: SessionPrefill = {};
  const day = first("day");
  if (day && options.days.some((d) => d.key === day)) prefill.day = day;
  const start = first("start");
  if (start && TIME_PATTERN.test(start)) prefill.start = start;
  const end = first("end");
  if (end && TIME_PATTERN.test(end)) prefill.end = end;
  const type = first("tipo");
  if (type && (SESSION_TYPES as readonly string[]).includes(type)) prefill.type = type as SessionTypeKey;

  return (
    <>
      <PageHeader
        eyebrow="Programa"
        title="Nueva sesión"
        description="Rellena al menos el día, las horas, el tipo, la ubicación y el título en español."
      />
      <SessionForm mode="create" prefill={prefill} days={options.days} venues={options.venues} rooms={options.rooms} />
    </>
  );
}
