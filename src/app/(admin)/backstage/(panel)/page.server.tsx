import type { Metadata } from "next";
import Link from "next/link";
import { Building2, CalendarDays, FileDown, ListChecks, MessageSquareText, Plus } from "lucide-react";
import { requireAdminPage } from "@/lib/admin/guard";
import { getOverview } from "@/lib/admin/overview";
import { countIssues } from "@/lib/programme-validate";
import { formatDateTime, plural } from "@/lib/admin/format";
import { PageHeader, SessionTypeChip } from "@/components/admin/bits";
import { Badge, Card, buttonClass } from "@/components/admin/ui";
import { ProgrammeStatusToggle } from "@/components/admin/ProgrammeStatusToggle";
import { ValidationList } from "@/components/admin/ValidationList";

export const metadata: Metadata = { title: "Resumen" };

function Stat({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-linea bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-tinta-tenue">
        <Icon className="h-4 w-4 text-mar-500" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-tinta">{value}</p>
      {children ? <div className="mt-1 text-xs text-tinta-suave">{children}</div> : null}
    </div>
  );
}

export default async function OverviewPage() {
  await requireAdminPage();
  const o = await getOverview();
  const counts = countIssues(o.issues);

  return (
    <>
      <PageHeader
        eyebrow="ieTIC 2027"
        title="Resumen"
        description="Estado del programa, cifras y avisos de validación. Los cambios del panel se reflejan al momento en la web pública."
        actions={
          <>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={CalendarDays} label="Sesiones" value={o.sessions.total}>
          {o.sessions.published} publicadas · {o.sessions.drafts} {o.sessions.drafts === 1 ? "borrador" : "borradores"}
          {o.sessions.cancelled ? ` · ${o.sessions.cancelled} canceladas` : ""}
        </Stat>
        <Stat icon={MessageSquareText} label="Contribuciones" value={o.talks}>
          Comunicaciones y proyectos dentro de las sesiones
        </Stat>
        <Stat icon={Building2} label="Salas activas" value={`${o.rooms.active}/${o.rooms.total}`}>
          En {plural(o.rooms.venues, "edificio", "edificios")}
        </Stat>
        <Stat
          icon={ListChecks}
          label="Validación"
          value={counts.error + counts.warning === 0 ? "OK" : counts.error + counts.warning}
        >
          {counts.error ? <span className="font-medium text-red-700">{plural(counts.error, "error", "errores")} · </span> : null}
          {counts.warning ? (
            <span className="font-medium text-amber-800">{plural(counts.warning, "aviso", "avisos")} · </span>
          ) : null}
          {plural(counts.info, "sugerencia", "sugerencias")}
        </Stat>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Card
            titleId="avisos"
            title="Avisos de validación"
            description="Solapes, horas o días incorrectos, salas inactivas, borradores y sesiones sin ponentes. Cada aviso enlaza a la sesión."
          >
            <ValidationList issues={o.issues} dayLabels={o.dayLabels} />
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card titleId="estado" title="Estado del programa">
            <ProgrammeStatusToggle status={o.status} />
            {o.lastUpdate ? (
              <p className="mt-3 text-xs text-tinta-tenue">Última modificación de una sesión: {formatDateTime(o.lastUpdate)}</p>
            ) : null}
          </Card>

          <Card titleId="por-dia" title="Sesiones por día">
            {o.byDay.length ? (
              <ul className="space-y-2">
                {o.byDay.map((d) => (
                  <li key={d.key} className="flex items-center justify-between gap-3 text-sm">
                    <Link
                      href={`/backstage/programa#dia-${d.key}`}
                      className="min-w-0 truncate text-tinta hover:text-mar-700 hover:underline"
                    >
                      {d.label}
                    </Link>
                    <span className="flex shrink-0 items-center gap-2">
                      {d.known ? null : <Badge tone="danger">sin día</Badge>}
                      <span className="tabular-nums text-tinta-suave">
                        <span className="font-semibold text-tinta">{d.total}</span>
                        {d.published !== d.total ? ` (${d.published} publ.)` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-tinta-suave">
                No hay días definidos.{" "}
                <Link href="/backstage/ajustes" className="enlace">
                  Añade los días en Ajustes
                </Link>
                .
              </p>
            )}
          </Card>

          <Card titleId="por-tipo" title="Sesiones por tipo">
            {o.byType.length ? (
              <ul className="flex flex-wrap gap-2">
                {o.byType.map((t) => (
                  <li key={t.type} className="flex items-center gap-1">
                    <SessionTypeChip type={t.type} />
                    <span className="text-xs font-semibold tabular-nums text-tinta-suave">{t.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-tinta-suave">Todavía no hay sesiones.</p>
            )}
          </Card>

          <Card titleId="salas" title="Salas por edificio">
            <ul className="space-y-2">
              {o.roomsByVenue.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">{v.name}</span>
                  <span className="shrink-0 tabular-nums text-tinta-suave">
                    <span className="font-semibold text-tinta">{v.active}</span> activas de {v.total}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/backstage/espacios" className="enlace mt-3 inline-block text-sm">
              Gestionar espacios
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
