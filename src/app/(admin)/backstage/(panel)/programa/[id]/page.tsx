import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin/guard";
import { getSessionData } from "@/lib/admin/sessions";
import { getProgrammeOptions } from "@/lib/admin/spaces";
import { getSessionIssues } from "@/lib/admin/overview";
import { PageHeader, SessionTypeChip } from "@/components/admin/bits";
import { SessionForm } from "@/components/admin/SessionForm";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await getSessionData(id);
  return { title: session ? `Editar: ${session.title}` : "Sesión no encontrada" };
}

export default async function EditSessionPage({ params }: Props) {
  await requireAdminPage();
  const { id } = await params;
  const [session, options, issues] = await Promise.all([getSessionData(id), getProgrammeOptions(), getSessionIssues(id)]);
  if (!session) notFound();

  const day = options.days.find((d) => d.key === session.day);

  return (
    <>
      <PageHeader
        eyebrow={
          <span className="inline-flex flex-wrap items-center gap-x-2">
            Programa · {day?.labelEs ?? session.day} · {session.start}–{session.end}
          </span>
        }
        title={session.title}
        description={<SessionTypeChip type={session.type} />}
      />
      <SessionForm
        key={session.id}
        mode="edit"
        session={session}
        days={options.days}
        venues={options.venues}
        rooms={options.rooms}
        issues={issues}
        dayLabels={Object.fromEntries(options.days.map((d) => [d.key, d.labelEs]))}
      />
    </>
  );
}
