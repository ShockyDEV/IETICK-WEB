"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CircleCheck, CircleX, Info, Pencil, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { countIssues, type IssueSeverity, type ValidationIssue } from "@/lib/programme-validate";

/**
 * Lista de avisos de validación del programa (como la pestaña «Validación»
 * del editor de ICED26). Cada aviso enlaza a la edición de sus sesiones.
 */

const SEVERITY: Record<IssueSeverity, { label: string; one: string; icon: LucideIcon; iconClass: string; chip: string }> = {
  error: {
    label: "Errores",
    one: "Error",
    icon: CircleX,
    iconClass: "text-red-600",
    chip: "aria-pressed:bg-red-700 aria-pressed:text-white aria-pressed:ring-red-700",
  },
  warning: {
    label: "Avisos",
    one: "Aviso",
    icon: TriangleAlert,
    iconClass: "text-amber-600",
    chip: "aria-pressed:bg-amber-500 aria-pressed:text-noche-900 aria-pressed:ring-amber-500",
  },
  info: {
    label: "Sugerencias",
    one: "Sugerencia",
    icon: Info,
    iconClass: "text-mar-500",
    chip: "aria-pressed:bg-mar-600 aria-pressed:text-white aria-pressed:ring-mar-600",
  },
};

const MAX_LINKS = 4;

type Filter = "all" | IssueSeverity;

export function ValidationList({
  issues,
  dayLabels = {},
  showFilter = true,
  emptyText = "Sin avisos: el programa es coherente.",
}: {
  issues: ValidationIssue[];
  dayLabels?: Record<string, string>;
  showFilter?: boolean;
  emptyText?: string;
}) {
  const counts = useMemo(() => countIssues(issues), [issues]);
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? issues : issues.filter((i) => i.severity === filter);

  if (!issues.length) {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-800">
        <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
        {emptyText}
      </p>
    );
  }

  const filters: { value: Filter; label: string; count: number; chip?: string }[] = [
    { value: "all", label: "Todos", count: issues.length },
    ...(["error", "warning", "info"] as const)
      .filter((s) => counts[s] > 0)
      .map((s) => ({ value: s, label: SEVERITY[s].label, count: counts[s], chip: SEVERITY[s].chip })),
  ];

  return (
    <div>
      {showFilter && filters.length > 2 ? (
        <div role="group" aria-label="Filtrar avisos por gravedad" className="mb-3 flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full bg-white px-2.5 py-1 text-xs font-medium text-tinta-suave ring-1 ring-inset ring-linea transition hover:text-tinta",
                f.chip ?? "aria-pressed:bg-noche-800 aria-pressed:text-white aria-pressed:ring-noche-800",
              )}
            >
              {f.label} <span className="tabular-nums opacity-80">({f.count})</span>
            </button>
          ))}
        </div>
      ) : null}

      <ul className="divide-y divide-linea overflow-hidden rounded-lg border border-linea bg-white">
        {visible.map((issue) => {
          const meta = SEVERITY[issue.severity];
          const Icon = meta.icon;
          const shown = issue.sessions.slice(0, MAX_LINKS);
          const hidden = issue.sessions.length - shown.length;
          return (
            <li key={issue.key} className="flex gap-3 px-3 py-2.5 sm:px-4">
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.iconClass)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-tinta">
                  <span className="sr-only">{meta.one}: </span>
                  {issue.message}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  {issue.day ? <span className="text-tinta-tenue">{dayLabels[issue.day] ?? issue.day}</span> : null}
                  {shown.map((s) => (
                    <Link
                      key={s.id}
                      href={`/backstage/programa/${s.id}`}
                      className="inline-flex max-w-full items-center gap-1 rounded font-medium text-mar-700 underline decoration-mar-200 underline-offset-2 hover:text-mar-900 hover:decoration-mar-500"
                    >
                      <Pencil className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="sr-only">Editar </span>
                      <span className="truncate">
                        {issue.day ? "" : `${dayLabels[s.day] ?? s.day}, `}
                        {s.start} · {s.title}
                      </span>
                    </Link>
                  ))}
                  {hidden > 0 ? <span className="text-tinta-tenue">y {hidden} más</span> : null}
                  {issue.code === "INACTIVE_ROOM" ? (
                    <Link
                      href="/backstage/espacios"
                      className="rounded font-medium text-mar-700 underline decoration-mar-200 underline-offset-2 hover:text-mar-900"
                    >
                      Ir a Espacios
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
