"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarPlus,
  CircleX,
  Copy,
  Eye,
  EyeOff,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  Users,
  MessageSquareText,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { SESSION_TYPES, SESSION_TYPE_META, type SessionTypeKey } from "@/lib/session-types";
import { apiRequest, errorMessage } from "@/lib/admin/api-client";
import { formatDayKey, normalizeSearch, plural } from "@/lib/admin/format";
import type { DayOption, SessionData, SessionRow } from "@/lib/admin/types";
import { SessionStatus, SessionTypeChip } from "@/components/admin/bits";
import { ConfirmDialog } from "@/components/admin/Dialog";
import { Button, EmptyState, buttonClass, inputClass, selectClass } from "@/components/admin/ui";

/**
 * Listado del programa en el panel: agrupado por día, ordenado por hora, con
 * buscador y filtros, y acciones por sesión (editar, publicar/despublicar,
 * duplicar, borrar). Las escrituras van a /api/admin/sessions/**.
 */

type IssueCounts = Record<string, { error: number; warning: number; info: number }>;
type StateFilter = "all" | "published" | "draft" | "cancelled";

interface Props {
  sessions: SessionRow[];
  days: DayOption[];
  issues: IssueCounts;
}

export function ProgrammeList({ sessions, days, issues }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | SessionTypeKey>("all");
  const [state, setState] = useState<StateFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<SessionRow | null>(null);

  const filtered = useMemo(() => {
    const words = normalizeSearch(query).split(" ").filter(Boolean);
    return sessions.filter((s) => {
      if (type !== "all" && s.type !== type) return false;
      if (state === "published" && !(s.published && !s.cancelled)) return false;
      if (state === "draft" && s.published) return false;
      if (state === "cancelled" && !s.cancelled) return false;
      return words.every((w) => s.search.includes(w));
    });
  }, [sessions, query, type, state]);

  // Secciones: días de la tabla (aunque estén vacíos) + días desconocidos
  const sections = useMemo(() => {
    const known = new Set(days.map((d) => d.key));
    const list = days.map((d) => ({
      key: d.key,
      label: d.labelEs,
      known: true,
      total: sessions.filter((s) => s.day === d.key).length,
      items: filtered.filter((s) => s.day === d.key),
    }));
    const orphanKeys = [...new Set(sessions.map((s) => s.day).filter((k) => !known.has(k)))].sort();
    for (const key of orphanKeys) {
      list.push({
        key,
        label: `${formatDayKey(key)} · no está en la tabla de días`,
        known: false,
        total: sessions.filter((s) => s.day === key).length,
        items: filtered.filter((s) => s.day === key),
      });
    }
    return list;
  }, [days, sessions, filtered]);

  const filtering = query.trim() !== "" || type !== "all" || state !== "all";

  async function togglePublished(s: SessionRow) {
    setBusyId(s.id);
    try {
      await apiRequest(`/api/admin/sessions/${s.id}`, { method: "PATCH", body: { published: !s.published } });
      toast.success(s.published ? `«${s.title}» pasa a borrador.` : `«${s.title}» publicada.`);
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  async function duplicate(s: SessionRow) {
    setBusyId(s.id);
    try {
      const { session } = await apiRequest<{ session: SessionData }>(`/api/admin/sessions/${s.id}/duplicate`, {
        method: "POST",
      });
      toast.success("Copia creada como borrador. Revísala y publícala cuando esté lista.");
      router.push(`/backstage/programa/${session.id}`);
    } catch (e) {
      toast.error(errorMessage(e));
      setBusyId(null);
    }
  }

  async function remove(s: SessionRow) {
    try {
      await apiRequest(`/api/admin/sessions/${s.id}`, { method: "DELETE" });
      toast.success(`«${s.title}» borrada.`);
      setToDelete(null);
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  function clearFilters() {
    setQuery("");
    setType("all");
    setState("all");
  }

  if (!sessions.length) {
    return (
      <div className="rounded-xl border border-linea bg-white shadow-sm">
        <EmptyState
          icon={<CalendarPlus className="h-8 w-8" aria-hidden="true" />}
          title="Todavía no hay sesiones"
          action={
            <Link href="/backstage/programa/nueva" className={buttonClass("primary")}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Crear la primera sesión
            </Link>
          }
        >
          {days.length ? null : (
            <>
              Antes, añade los días del congreso en{" "}
              <Link href="/backstage/ajustes" className="enlace">
                Ajustes
              </Link>
              .
            </>
          )}
        </EmptyState>
      </div>
    );
  }

  return (
    <div>
      {/* Barra de búsqueda y filtros */}
      <div className="sticky top-14 z-10 -mx-4 mb-4 border-b border-linea bg-papel/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[14rem] flex-1">
            <label htmlFor="prog-search" className="sr-only">
              Buscar sesiones
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-tenue" aria-hidden="true" />
            <input
              id="prog-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, ponente, sala, contribución…"
              className={cn(inputClass, "pl-9")}
            />
          </div>
          <div>
            <label htmlFor="prog-type" className="sr-only">
              Tipo de sesión
            </label>
            <select id="prog-type" value={type} onChange={(e) => setType(e.target.value as typeof type)} className={selectClass}>
              <option value="all">Todos los tipos</option>
              {SESSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SESSION_TYPE_META[t].label.es}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="prog-state" className="sr-only">
              Estado
            </label>
            <select
              id="prog-state"
              value={state}
              onChange={(e) => setState(e.target.value as StateFilter)}
              className={selectClass}
            >
              <option value="all">Todos los estados</option>
              <option value="published">Publicadas</option>
              <option value="draft">Borradores</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
          {filtering ? (
            <Button variant="ghost" onClick={clearFilters}>
              <CircleX className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </Button>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-tinta-tenue">
          <p aria-live="polite">
            {filtering
              ? `${plural(filtered.length, "sesión coincide", "sesiones coinciden")} de ${sessions.length}`
              : plural(sessions.length, "sesión", "sesiones")}
          </p>
          <nav aria-label="Ir a un día" className="flex flex-wrap gap-1.5">
            {sections.map((sec) => (
              <a
                key={sec.key}
                href={`#dia-${sec.key}`}
                className={cn(
                  "rounded-full px-2 py-0.5 font-medium ring-1 ring-inset transition",
                  sec.known ? "text-mar-700 ring-mar-100 hover:bg-mar-50" : "text-red-700 ring-red-200 hover:bg-red-50",
                )}
              >
                {sec.known ? sec.label : sec.key} <span className="tabular-nums">({sec.items.length})</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {filtering && !filtered.length ? (
        <div className="rounded-xl border border-linea bg-white shadow-sm">
          <EmptyState
            icon={<Search className="h-8 w-8" aria-hidden="true" />}
            title="Ninguna sesión coincide con la búsqueda"
            action={<Button onClick={clearFilters}>Limpiar filtros</Button>}
          />
        </div>
      ) : null}

      <div className="space-y-8">
        {sections.map((sec) =>
          filtering && !sec.items.length ? null : (
            <section key={sec.key} id={`dia-${sec.key}`} aria-labelledby={`dia-${sec.key}-titulo`} className="scroll-mt-24">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 id={`dia-${sec.key}-titulo`} className="font-sans text-base font-semibold tracking-normal">
                    {sec.label}
                  </h2>
                  <p className="text-xs text-tinta-tenue">
                    <span className="font-mono">{sec.key}</span> · {plural(sec.total, "sesión", "sesiones")}
                    {sec.known ? null : (
                      <span className="font-medium text-red-700"> · añade este día en Ajustes o mueve sus sesiones</span>
                    )}
                  </p>
                </div>
                {sec.known ? (
                  <Link href={`/backstage/programa/nueva?day=${sec.key}`} className={buttonClass("secondary", "sm")}>
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    Sesión en este día
                  </Link>
                ) : null}
              </div>

              {sec.items.length ? (
                <div className="overflow-x-auto rounded-xl border border-linea bg-white shadow-sm">
                  <table className="w-full min-w-[20rem] text-left text-sm">
                    <caption className="sr-only">Sesiones del {sec.label}</caption>
                    <thead className="border-b border-linea bg-papel/70 text-xs uppercase tracking-wide text-tinta-tenue">
                      <tr>
                        <th scope="col" className="w-28 px-3 py-2 font-medium sm:px-4">
                          Hora
                        </th>
                        <th scope="col" className="hidden w-44 px-3 py-2 font-medium md:table-cell">
                          Tipo
                        </th>
                        <th scope="col" className="px-3 py-2 font-medium">
                          Título
                        </th>
                        <th scope="col" className="hidden w-56 px-3 py-2 font-medium lg:table-cell">
                          Ubicación
                        </th>
                        <th scope="col" className="hidden w-28 px-3 py-2 font-medium md:table-cell">
                          Estado
                        </th>
                        <th scope="col" className="w-px px-3 py-2 text-right font-medium sm:px-4">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-linea">
                      {sec.items.map((s) => (
                        <SessionRowView
                          key={s.id}
                          s={s}
                          issues={issues[s.id]}
                          busy={busyId === s.id}
                          onToggle={() => togglePublished(s)}
                          onDuplicate={() => duplicate(s)}
                          onDelete={() => setToDelete(s)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-linea bg-white/60 px-4 py-6 text-center text-sm text-tinta-tenue">
                  Sin sesiones este día.
                </p>
              )}
            </section>
          ),
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="¿Borrar la sesión?"
        confirmLabel="Borrar sesión"
        onClose={() => setToDelete(null)}
        onConfirm={() => (toDelete ? remove(toDelete) : undefined)}
      >
        {toDelete ? (
          <>
            <p>
              Se borrará <strong className="text-tinta">«{toDelete.title}»</strong> ({formatDayKey(toDelete.day)},{" "}
              {toDelete.start}–{toDelete.end})
              {toDelete.talksCount ? ` junto con ${plural(toDelete.talksCount, "contribución", "contribuciones")}` : ""}.
            </p>
            <p>Esta acción no se puede deshacer. Si solo quieres ocultarla de la web, pásala a borrador.</p>
          </>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}

function SessionRowView({
  s,
  issues,
  busy,
  onToggle,
  onDuplicate,
  onDelete,
}: {
  s: SessionRow;
  issues?: { error: number; warning: number; info: number };
  busy: boolean;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const href = `/backstage/programa/${s.id}`;
  const problems = (issues?.error ?? 0) + (issues?.warning ?? 0);
  return (
    <tr className={cn("align-top transition hover:bg-mar-50/40", s.cancelled && "bg-red-50/30")}>
      <td className="whitespace-nowrap px-3 py-3 font-mono text-[0.8125rem] tabular-nums text-tinta sm:px-4">
        {s.start}
        <span className="text-tinta-tenue">–{s.end}</span>
      </td>
      <td className="hidden px-3 py-3 md:table-cell">
        <SessionTypeChip type={s.type} />
      </td>
      <td className="min-w-[12rem] px-3 py-3">
        <div className="flex items-start gap-1.5">
          {problems ? (
            <span
              className={cn("mt-0.5 shrink-0", issues?.error ? "text-red-600" : "text-amber-600")}
              title={`${plural(problems, "aviso", "avisos")} de validación`}
            >
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{plural(problems, "aviso", "avisos")} de validación: </span>
            </span>
          ) : null}
          <Link
            href={href}
            className={cn(
              "font-medium text-tinta hover:text-mar-700 hover:underline",
              s.cancelled && "line-through decoration-red-400",
            )}
          >
            {s.title}
          </Link>
        </div>
        {s.subtitle ? <p className="mt-0.5 text-xs text-tinta-suave">{s.subtitle}</p> : null}
        {s.speakersCount || s.talksCount ? (
          <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-tinta-tenue">
            {s.speakersCount ? (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" aria-hidden="true" />
                {plural(s.speakersCount, "ponente", "ponentes")}
              </span>
            ) : null}
            {s.talksCount ? (
              <span className="inline-flex items-center gap-1">
                <MessageSquareText className="h-3 w-3" aria-hidden="true" />
                {plural(s.talksCount, "contribución", "contribuciones")}
              </span>
            ) : null}
          </p>
        ) : null}
        {/* En pantallas estrechas, tipo, ubicación y estado van bajo el título */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 md:hidden">
          <SessionTypeChip type={s.type} />
          <SessionStatus published={s.published} cancelled={s.cancelled} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-tinta-suave lg:hidden">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          {s.locationLabel}
        </p>
      </td>
      <td className="hidden px-3 py-3 lg:table-cell">
        <p className="text-tinta">{s.locationLabel}</p>
        {s.locationDetail ? <p className="mt-0.5 text-xs text-tinta-tenue">{s.locationDetail}</p> : null}
      </td>
      <td className="hidden px-3 py-3 md:table-cell">
        <SessionStatus published={s.published} cancelled={s.cancelled} />
      </td>
      <td className="px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap justify-end gap-0.5 sm:flex-nowrap">
          <Link href={href} className={buttonClass("ghost", "icon-sm")} title="Editar">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Editar «{s.title}»</span>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            disabled={busy}
            title={s.published ? "Pasar a borrador (ocultar de la web)" : "Publicar"}
          >
            {s.published ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            <span className="sr-only">
              {s.published ? "Despublicar" : "Publicar"} «{s.title}»
            </span>
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDuplicate} disabled={busy} title="Duplicar">
            <Copy className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Duplicar «{s.title}»</span>
          </Button>
          <Button variant="danger-ghost" size="icon-sm" onClick={onDelete} disabled={busy} title="Borrar">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Borrar «{s.title}»</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}
