import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FileDown, Plus } from "lucide-react";
import { requireAdminPage } from "@/lib/admin/guard";
import { listSessionRows } from "@/lib/admin/sessions";
import { getProgrammeOptions } from "@/lib/admin/spaces";
import { getProgrammeIssues, issuesBySession } from "@/lib/admin/overview";
import { PageHeader } from "@/components/admin/bits";
import { buttonClass } from "@/components/admin/ui";
import { ProgrammeList } from "@/components/admin/ProgrammeList";

export const metadata: Metadata = { title: "Programa" };

export default async function ProgrammePage() {
  await requireAdminPage();
  const [sessions, options, issues] = await Promise.all([
    listSessionRows(),
    getProgrammeOptions(),
    getProgrammeIssues(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Programa"
        title="Sesiones del programa"
        description="Todas las sesiones, incluidos los borradores (no visibles en la web) y las canceladas. Pulsa una sesión para editarla."
        actions={
          <>
            <a href="/programa" target="_blank" rel="noopener noreferrer" className={buttonClass("ghost")}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Ver en la web
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            <a href="/api/admin/export" download className={buttonClass("secondary")}>
              <FileDown className="h-4 w-4" aria-hidden="true" />
              Exportar JSON
            </a>
            <Link href="/backstage/programa/nueva" className={buttonClass("primary")}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nueva sesión
            </Link>
          </>
        }
      />
      <ProgrammeList sessions={sessions} days={options.days} issues={issuesBySession(issues)} />
    </>
  );
}
