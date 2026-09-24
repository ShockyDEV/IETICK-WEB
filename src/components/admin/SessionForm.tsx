"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Copy, ExternalLink, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { SESSION_TYPES, SESSION_TYPE_META, type SessionTypeKey } from "@/lib/session-types";
import type { ValidationIssue } from "@/lib/programme-validate";
import { issuesToFieldErrors, zodIssues, type FieldIssue } from "@/lib/admin/errors";
import { ApiError, apiRequest, errorMessage } from "@/lib/admin/api-client";
import { sessionInputSchema, type SessionPayload } from "@/lib/admin/schemas";
import { buildLocationOptions, decodeLocation, encodeLocation } from "@/lib/admin/location";
import { durationLabel, formatDateTime, plural, textLines } from "@/lib/admin/format";
import type { DayOption, RoomOption, SessionData, VenueOption } from "@/lib/admin/types";
import { SessionStatus, SessionTypeChip } from "@/components/admin/bits";
import { ConfirmDialog } from "@/components/admin/Dialog";
import { TalksEditor, talkFieldId, type TalkDraft } from "@/components/admin/TalksEditor";
import { ValidationList } from "@/components/admin/ValidationList";
import {
  Button,
  Card,
  Checkbox,
  Field,
  buttonClass,
  describedBy,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/ui";

/**
 * Formulario de sesión (crear y editar). Valida con el mismo esquema zod que
 * la API antes de enviar; los errores de la API (400 con `issues`) se pintan
 * en su campo. Ctrl/Cmd+S guarda. Avisa al salir con cambios sin guardar.
 */

interface FormState {
  day: string;
  start: string;
  end: string;
  type: SessionTypeKey | "";
  title: string;
  titlePt: string;
  subtitle: string;
  subtitlePt: string;
  description: string;
  descriptionPt: string;
  speakers: string;
  chair: string;
  /** Valor del select de ubicación: "general" | "venue:<id>" | "room:<id>". */
  where: string;
  location: string;
  locationPt: string;
  streamUrl: string;
  published: boolean;
  cancelled: boolean;
  talks: TalkDraft[];
}

export interface SessionPrefill {
  day?: string;
  start?: string;
  end?: string;
  where?: string;
  type?: SessionTypeKey;
}

function fromSession(s: SessionData): FormState {
  return {
    day: s.day,
    start: s.start,
    end: s.end,
    type: s.type,
    title: s.title,
    titlePt: s.titlePt ?? "",
    subtitle: s.subtitle ?? "",
    subtitlePt: s.subtitlePt ?? "",
    description: s.description ?? "",
    descriptionPt: s.descriptionPt ?? "",
    speakers: s.speakers ?? "",
    chair: s.chair ?? "",
    where: encodeLocation(s.roomId, s.venueId),
    location: s.location ?? "",
    locationPt: s.locationPt ?? "",
    streamUrl: s.streamUrl ?? "",
    published: s.published,
    cancelled: s.cancelled,
    talks: s.talks.map((t) => ({
      key: t.id,
      id: t.id,
      title: t.title,
      authors: t.authors ?? "",
      presenter: t.presenter ?? "",
      abstract: t.abstract ?? "",
      axis: t.axis ?? "",
    })),
  };
}

function emptyForm(days: DayOption[], prefill: SessionPrefill = {}): FormState {
  return {
    day: prefill.day ?? days[0]?.key ?? "",
    start: prefill.start ?? "09:00",
    end: prefill.end ?? "10:00",
    type: prefill.type ?? "",
    title: "",
    titlePt: "",
    subtitle: "",
    subtitlePt: "",
    description: "",
    descriptionPt: "",
    speakers: "",
    chair: "",
    where: prefill.where ?? "general",
    location: "",
    locationPt: "",
    streamUrl: "",
    published: true,
    cancelled: false,
    talks: [],
  };
}

function toPayload(f: FormState): SessionPayload {
  const { roomId, venueId } = decodeLocation(f.where);
  return {
    day: f.day,
    start: f.start,
    end: f.end,
    type: f.type as SessionTypeKey,
    title: f.title,
    titlePt: f.titlePt,
    subtitle: f.subtitle,
    subtitlePt: f.subtitlePt,
    description: f.description,
    descriptionPt: f.descriptionPt,
    speakers: f.speakers,
    chair: f.chair,
    roomId,
    venueId,
    location: f.location,
    locationPt: f.locationPt,
    streamUrl: f.streamUrl,
    published: f.published,
    cancelled: f.cancelled,
    talks: f.talks.map((t) => ({
      id: t.id,
      title: t.title,
      authors: t.authors,
      presenter: t.presenter,
      abstract: t.abstract,
      axis: t.axis,
    })),
  };
}

/** Normaliza rutas de error de la API/zod a claves del formulario. */
function normalizePath(path: string): string {
  if (path === "roomId" || path === "venueId") return "where";
  return path;
}

interface Props {
  mode: "create" | "edit";
  session?: SessionData;
  prefill?: SessionPrefill;
  days: DayOption[];
  venues: VenueOption[];
  rooms: RoomOption[];
  issues?: ValidationIssue[];
  dayLabels?: Record<string, string>;
}

export function SessionForm({ mode, session, prefill, days, venues, rooms, issues = [], dayLabels = {} }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<FormState>(() =>
    session ? fromSession(session) : emptyForm(days, prefill),
  );
  const [baseline, setBaseline] = useState(() => JSON.stringify(toPayload(form)));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const snapshot = useMemo(() => JSON.stringify(toPayload(form)), [form]);
  const dirty = snapshot !== baseline;

  const locationOptions = useMemo(() => buildLocationOptions(venues, rooms), [venues, rooms]);
  const knownLocations = useMemo(
    () =>
      new Set([
        locationOptions.general.value,
        ...locationOptions.wholeVenues.map((o) => o.value),
        ...locationOptions.groups.flatMap((g) => g.options.map((o) => o.value)),
      ]),
    [locationOptions],
  );
  const dayKnown = days.some((d) => d.key === form.day);
  const duration = durationLabel(form.start, form.end);
  const speakers = textLines(form.speakers).length;

  // Aviso al cerrar/recargar con cambios sin guardar
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Ctrl/Cmd+S guarda
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    // Al corregir un campo desaparece su error (en contribuciones, los de todas)
    const stale = Object.keys(errors).filter((path) =>
      key === "talks" ? path.startsWith("talks.") : path === key || (key === "end" && path === "start"),
    );
    if (stale.length) {
      setErrors((e) => {
        const next = { ...e };
        for (const path of stale) delete next[path];
        return next;
      });
    }
  }

  /** Pinta los errores y lleva el foco al primero. */
  function showIssues(list: FieldIssue[]) {
    const mapped = issuesToFieldErrors(list.map((i) => ({ ...i, path: normalizePath(i.path) })));
    setErrors(mapped);
    const first = list[0] ? normalizePath(list[0].path) : null;
    if (!first) return;
    let id = `sf-${first}`;
    const talk = /^talks\.(\d+)\.(\w+)$/.exec(first);
    if (talk) {
      const t = form.talks[Number(talk[1])];
      if (t) id = talkFieldId(t.key, talk[2] as "title");
    }
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  async function onSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (saving) return;
    if (mode === "edit" && !dirty) {
      toast("No hay cambios que guardar.");
      return;
    }
    const payload = toPayload(form);
    const parsed = sessionInputSchema.safeParse(payload);
    if (!parsed.success) {
      showIssues(zodIssues(parsed.error));
      toast.error("Revisa los campos marcados.");
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (mode === "create") {
        const { session: created } = await apiRequest<{ session: SessionData }>("/api/admin/sessions", {
          method: "POST",
          body: payload,
        });
        setBaseline(snapshot);
        toast.success(created.published ? "Sesión creada y publicada." : "Sesión creada como borrador.");
        router.replace(`/backstage/programa/${created.id}`);
      } else if (session) {
        const { session: saved } = await apiRequest<{ session: SessionData }>(`/api/admin/sessions/${session.id}`, {
          method: "PUT",
          body: payload,
        });
        const next = fromSession(saved);
        setForm(next);
        setBaseline(JSON.stringify(toPayload(next)));
        toast.success("Cambios guardados.");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof ApiError && err.issues.length) showIssues(err.issues);
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!session) return;
    try {
      await apiRequest(`/api/admin/sessions/${session.id}`, { method: "DELETE" });
      setBaseline(snapshot);
      toast.success(`«${session.title}» borrada.`);
      router.push("/backstage/programa");
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function onDuplicate() {
    if (!session) return;
    if (dirty) {
      toast.error("Guarda (o descarta) los cambios antes de duplicar.");
      return;
    }
    setDuplicating(true);
    try {
      const { session: copy } = await apiRequest<{ session: SessionData }>(
        `/api/admin/sessions/${session.id}/duplicate`,
        { method: "POST" },
      );
      toast.success("Copia creada como borrador.");
      router.push(`/backstage/programa/${copy.id}`);
    } catch (err) {
      toast.error(errorMessage(err));
      setDuplicating(false);
    }
  }

  function discard() {
    setForm(session ? fromSession(session) : emptyForm(days, prefill));
    setErrors({});
  }

  const err = (key: string) => errors[key];

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby="sf-help" className="pb-24">
      <p id="sf-help" className="sr-only">
        Los campos marcados con asterisco son obligatorios. Ctrl+S guarda.
      </p>

      {mode === "edit" && issues.length ? (
        <Card titleId="sf-avisos" title="Avisos de esta sesión" className="mb-6 border-amber-200">
          <ValidationList issues={issues} dayLabels={dayLabels} showFilter={false} />
        </Card>
      ) : null}

      {Object.keys(errors).length ? (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">No se ha podido guardar: revisa los campos marcados.</p>
          <ul className="mt-1 list-inside list-disc text-xs">
            {Object.entries(errors)
              .slice(0, 6)
              .map(([path, message]) => (
                <li key={path}>{message}</li>
              ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card titleId="sf-contenido" title="Contenido" description="Textos en español y portugués (si falta el portugués, la web muestra el español).">
            <div className="space-y-5">
              <Pair
                legend="Título"
                required
                es={
                  <input
                    {...describedBy("sf-title", { error: err("title") })}
                    type="text"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    maxLength={300}
                    aria-required="true"
                    className={inputClass}
                  />
                }
                pt={
                  <input
                    {...describedBy("sf-titlePt", { error: err("titlePt") })}
                    type="text"
                    value={form.titlePt}
                    onChange={(e) => set("titlePt", e.target.value)}
                    maxLength={300}
                    lang="pt"
                    className={inputClass}
                  />
                }
                errorEs={err("title")}
                errorPt={err("titlePt")}
                idEs="sf-title"
                idPt="sf-titlePt"
              />
              <Pair
                legend="Subtítulo"
                es={
                  <input
                    {...describedBy("sf-subtitle", { error: err("subtitle") })}
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => set("subtitle", e.target.value)}
                    maxLength={300}
                    placeholder="p. ej. Ponente por anunciar"
                    className={inputClass}
                  />
                }
                pt={
                  <input
                    {...describedBy("sf-subtitlePt", { error: err("subtitlePt") })}
                    type="text"
                    value={form.subtitlePt}
                    onChange={(e) => set("subtitlePt", e.target.value)}
                    maxLength={300}
                    lang="pt"
                    placeholder="p. ex. Orador a anunciar"
                    className={inputClass}
                  />
                }
                errorEs={err("subtitle")}
                errorPt={err("subtitlePt")}
                idEs="sf-subtitle"
                idPt="sf-subtitlePt"
              />
              <Pair
                legend="Descripción"
                es={
                  <textarea
                    {...describedBy("sf-description", { error: err("description") })}
                    rows={5}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    className={textareaClass}
                  />
                }
                pt={
                  <textarea
                    {...describedBy("sf-descriptionPt", { error: err("descriptionPt") })}
                    rows={5}
                    value={form.descriptionPt}
                    onChange={(e) => set("descriptionPt", e.target.value)}
                    lang="pt"
                    className={textareaClass}
                  />
                }
                errorEs={err("description")}
                errorPt={err("descriptionPt")}
                idEs="sf-description"
                idPt="sf-descriptionPt"
              />
            </div>
          </Card>

          <Card titleId="sf-participantes" title="Participantes">
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                id="sf-speakers"
                label="Ponentes"
                hint="Uno por línea: Nombre Apellido (Universidad)"
                error={err("speakers")}
                aside={speakers ? plural(speakers, "ponente", "ponentes") : undefined}
              >
                <textarea
                  {...describedBy("sf-speakers", { hint: true, error: err("speakers") })}
                  rows={5}
                  value={form.speakers}
                  onChange={(e) => set("speakers", e.target.value)}
                  className={textareaClass}
                />
              </Field>
              <Field id="sf-chair" label="Modera / coordina" error={err("chair")}>
                <input
                  {...describedBy("sf-chair", { error: err("chair") })}
                  type="text"
                  value={form.chair}
                  onChange={(e) => set("chair", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </Card>

          <Card
            titleId="sf-contribuciones"
            title={`Contribuciones${form.talks.length ? ` (${form.talks.length})` : ""}`}
            description="Comunicaciones o proyectos que se presentan dentro de la sesión, en su orden."
          >
            <TalksEditor talks={form.talks} onChange={(talks) => set("talks", talks)} errors={errors} disabled={saving} />
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="min-w-0 space-y-6">
          <Card titleId="sf-cuando" title="Cuándo y dónde">
            <div className="space-y-4">
              <Field id="sf-day" label="Día" required error={err("day")}>
                <select
                  {...describedBy("sf-day", { error: err("day") })}
                  value={form.day}
                  onChange={(e) => set("day", e.target.value)}
                  aria-required="true"
                  className={selectClass}
                >
                  {!form.day ? <option value="">— Elige un día —</option> : null}
                  {days.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.labelEs}
                    </option>
                  ))}
                  {form.day && !dayKnown ? <option value={form.day}>{form.day} (no está en Días)</option> : null}
                </select>
              </Field>
              {!days.length ? (
                <p className="text-xs text-red-700">
                  No hay días definidos.{" "}
                  <Link href="/backstage/ajustes" className="underline">
                    Añádelos en Ajustes
                  </Link>
                  .
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <Field id="sf-start" label="Inicio" required error={err("start")}>
                  <input
                    {...describedBy("sf-start", { error: err("start") })}
                    type="time"
                    step={300}
                    value={form.start}
                    onChange={(e) => set("start", e.target.value)}
                    aria-required="true"
                    className={cn(inputClass, "font-mono tabular-nums")}
                  />
                </Field>
                <Field id="sf-end" label="Fin" required error={err("end")}>
                  <input
                    {...describedBy("sf-end", { error: err("end") })}
                    type="time"
                    step={300}
                    value={form.end}
                    onChange={(e) => set("end", e.target.value)}
                    aria-required="true"
                    className={cn(inputClass, "font-mono tabular-nums")}
                  />
                </Field>
              </div>
              <p className="-mt-2 text-xs text-tinta-tenue" aria-live="polite">
                {duration ? `Duración: ${duration} · hora de Madrid` : "Hora de Madrid (HH:MM)"}
              </p>

              <Field
                id="sf-type"
                label="Tipo"
                required
                error={err("type")}
                aside={form.type ? <SessionTypeChip type={form.type} /> : undefined}
              >
                <select
                  {...describedBy("sf-type", { error: err("type") })}
                  value={form.type}
                  onChange={(e) => set("type", e.target.value as SessionTypeKey | "")}
                  aria-required="true"
                  className={selectClass}
                >
                  <option value="">— Elige un tipo —</option>
                  {SESSION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {SESSION_TYPE_META[t].label.es}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                id="sf-where"
                label="Ubicación"
                required
                error={err("where")}
                hint="Una sala, todas las salas de un edificio (sesiones simultáneas sin aula asignada) o la fila general (pausas, acreditaciones…)."
              >
                <select
                  {...describedBy("sf-where", { hint: true, error: err("where") })}
                  value={form.where}
                  onChange={(e) => set("where", e.target.value)}
                  className={selectClass}
                >
                  <option value={locationOptions.general.value}>{locationOptions.general.label}</option>
                  {locationOptions.wholeVenues.length ? (
                    <optgroup label="Todo un edificio">
                      {locationOptions.wholeVenues.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                  {locationOptions.groups.map((g) => (
                    <optgroup key={g.label} label={`Salas · ${g.label}`}>
                      {g.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  {!knownLocations.has(form.where) ? (
                    <option value={form.where}>Ubicación desconocida ({form.where})</option>
                  ) : null}
                </select>
              </Field>

              <fieldset className="space-y-2">
                <legend className="mb-1 text-sm font-medium text-tinta">Lugar externo</legend>
                <p id="sf-location-hint" className="text-xs text-tinta-tenue">
                  Opcional, para actividades fuera de las salas (p. ej. punto de encuentro de la visita).
                </p>
                <div>
                  <label htmlFor="sf-location" className="sr-only">
                    Lugar externo en español
                  </label>
                  <input
                    id="sf-location"
                    type="text"
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="ES · Punto de encuentro…"
                    aria-describedby={err("location") ? "sf-location-hint sf-location-error" : "sf-location-hint"}
                    aria-invalid={err("location") ? true : undefined}
                    className={inputClass}
                  />
                  {err("location") ? (
                    <p id="sf-location-error" className="mt-1 text-xs font-medium text-red-700">
                      {err("location")}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="sf-locationPt" className="sr-only">
                    Lugar externo en portugués
                  </label>
                  <input
                    id="sf-locationPt"
                    type="text"
                    lang="pt"
                    value={form.locationPt}
                    onChange={(e) => set("locationPt", e.target.value)}
                    placeholder="PT · Ponto de encontro…"
                    aria-describedby="sf-location-hint"
                    aria-invalid={err("locationPt") ? true : undefined}
                    className={inputClass}
                  />
                  {err("locationPt") ? (
                    <p className="mt-1 text-xs font-medium text-red-700">{err("locationPt")}</p>
                  ) : null}
                </div>
              </fieldset>
            </div>
          </Card>

          <Card titleId="sf-publicacion" title="Publicación">
            <div className="space-y-4">
              <Checkbox
                id="sf-published"
                label="Publicada"
                description="Si no, es un borrador: solo se ve en el panel."
                checked={form.published}
                onChange={(v) => set("published", v)}
              />
              <Checkbox
                id="sf-cancelled"
                label="Cancelada"
                description="Se sigue mostrando, marcada como cancelada."
                checked={form.cancelled}
                onChange={(v) => set("cancelled", v)}
              />
              <Field id="sf-streamUrl" label="URL de emisión" error={err("streamUrl")} hint="Opcional: enlace a la retransmisión en directo.">
                <input
                  {...describedBy("sf-streamUrl", { hint: true, error: err("streamUrl") })}
                  type="url"
                  inputMode="url"
                  value={form.streamUrl}
                  onChange={(e) => set("streamUrl", e.target.value)}
                  placeholder="https://…"
                  className={inputClass}
                />
              </Field>
            </div>
          </Card>

          {mode === "edit" && session ? (
            <Card titleId="sf-acciones" title="Más acciones">
              <div className="flex flex-wrap gap-2">
                <Button onClick={onDuplicate} busy={duplicating} disabled={saving}>
                  {duplicating ? null : <Copy className="h-4 w-4" aria-hidden="true" />}
                  Duplicar
                </Button>
                <a href="/programa" target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Ver en la web
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
                <Button variant="danger-ghost" onClick={() => setConfirmDelete(true)} disabled={saving}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Borrar
                </Button>
              </div>
              <dl className="mt-4 grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-xs text-tinta-tenue">
                <dt>Creada</dt>
                <dd>{formatDateTime(session.createdAt)}</dd>
                <dt>Modificada</dt>
                <dd>{formatDateTime(session.updatedAt)}</dd>
                <dt>Id</dt>
                <dd className="truncate font-mono">{session.id}</dd>
              </dl>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Barra de guardado (siempre visible) */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-linea bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <Link href="/backstage/programa" className={buttonClass("ghost")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Volver al programa</span>
              <span className="sm:hidden">Volver</span>
            </Link>
            <span className="hidden items-center gap-2 md:inline-flex">
              <SessionStatus published={form.published} cancelled={form.cancelled} />
            </span>
            <span
              className={cn("text-xs", dirty ? "font-medium text-oro-800" : "text-tinta-tenue")}
              aria-live="polite"
            >
              {dirty ? "Cambios sin guardar" : mode === "edit" ? "Todo guardado" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {dirty && mode === "edit" ? (
              <Button variant="ghost" onClick={discard} disabled={saving}>
                Descartar
              </Button>
            ) : null}
            <Button type="submit" variant="primary" busy={saving} disabled={mode === "edit" && !dirty}>
              {saving ? null : <Save className="h-4 w-4" aria-hidden="true" />}
              {mode === "create" ? "Crear sesión" : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="¿Borrar esta sesión?"
        confirmLabel="Borrar sesión"
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
      >
        <p>
          Se borrará <strong className="text-tinta">«{session?.title}»</strong>
          {session?.talks.length ? ` y sus ${plural(session.talks.length, "contribución", "contribuciones")}` : ""}. Esta
          acción no se puede deshacer.
        </p>
        <p>Si solo quieres ocultarla de la web, desmarca «Publicada» y guarda.</p>
      </ConfirmDialog>
    </form>
  );
}

/** Par de controles ES / PT bajo una misma leyenda. */
function Pair({
  legend,
  required,
  es,
  pt,
  idEs,
  idPt,
  errorEs,
  errorPt,
}: {
  legend: string;
  required?: boolean;
  es: ReactNode;
  pt: ReactNode;
  idEs: string;
  idPt: string;
  errorEs?: string;
  errorPt?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-tinta">
        {legend}
        {required ? (
          <>
            <span className="ml-0.5 text-red-700" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (obligatorio en español)</span>
          </>
        ) : null}
      </legend>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor={idEs} className="mb-1 flex items-center gap-1.5 text-xs font-medium text-tinta-suave">
            <span className="rounded bg-mar-50 px-1 font-mono text-[0.625rem] text-mar-700" aria-hidden="true">
              ES
            </span>
            Español
          </label>
          {es}
          {errorEs ? (
            <p id={`${idEs}-error`} className="mt-1 text-xs font-medium text-red-700">
              {errorEs}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor={idPt} className="mb-1 flex items-center gap-1.5 text-xs font-medium text-tinta-suave">
            <span className="rounded bg-oro-50 px-1 font-mono text-[0.625rem] text-oro-800" aria-hidden="true">
              PT
            </span>
            Português
          </label>
          {pt}
          {errorPt ? (
            <p id={`${idPt}-error`} className="mt-1 text-xs font-medium text-red-700">
              {errorPt}
            </p>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
}
