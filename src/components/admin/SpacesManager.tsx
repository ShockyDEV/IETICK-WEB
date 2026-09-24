"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Accessibility, Building2, DoorOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { ApiError, apiRequest, errorMessage } from "@/lib/admin/api-client";
import { issuesToFieldErrors, zodIssues, type FieldIssue } from "@/lib/admin/errors";
import { plural } from "@/lib/admin/format";
import { roomInputSchema, venueInputSchema } from "@/lib/admin/schemas";
import { slugify } from "@/lib/admin/slug";
import type { RoomData, VenueData } from "@/lib/admin/types";
import { ConfirmDialog, Dialog } from "@/components/admin/Dialog";
import {
  Badge,
  Button,
  Checkbox,
  Code,
  EmptyState,
  Field,
  Switch,
  describedBy,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/ui";

/**
 * Gestión de espacios: edificios (Venue) y sus salas (Room). Los
 * identificadores son slugs estables generados al crear. Una sala con
 * sesiones no se borra: se propone desactivarla.
 */

type Editing =
  | { kind: "venue"; venue: VenueData | null }
  | { kind: "room"; room: RoomData | null; venueId: string }
  | null;

type Confirming =
  | { kind: "venue"; venue: VenueData }
  | { kind: "room"; room: RoomData }
  | { kind: "deactivate"; room: RoomData }
  | null;

export function SpacesManager({ venues }: { venues: VenueData[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [confirming, setConfirming] = useState<Confirming>(null);
  const [busyRoom, setBusyRoom] = useState<string | null>(null);

  async function setActive(room: RoomData, active: boolean) {
    setBusyRoom(room.id);
    try {
      await apiRequest(`/api/admin/rooms/${room.id}`, { method: "PATCH", body: { active } });
      toast.success(active ? `${room.name} activada.` : `${room.name} desactivada: ya no aparece en la web.`);
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusyRoom(null);
    }
  }

  async function confirmAction() {
    if (!confirming) return;
    try {
      if (confirming.kind === "venue") {
        await apiRequest(`/api/admin/venues/${confirming.venue.id}`, { method: "DELETE" });
        toast.success(`Edificio «${confirming.venue.name}» borrado.`);
      } else if (confirming.kind === "room") {
        await apiRequest(`/api/admin/rooms/${confirming.room.id}`, { method: "DELETE" });
        toast.success(`Sala «${confirming.room.name}» borrada.`);
      } else {
        await apiRequest(`/api/admin/rooms/${confirming.room.id}`, { method: "PATCH", body: { active: false } });
        toast.success(`${confirming.room.name} desactivada: ya no aparece en la web.`);
      }
      setConfirming(null);
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  function askDeleteRoom(room: RoomData) {
    // Con sesiones no se puede borrar: se propone desactivarla
    setConfirming(room.sessionsCount > 0 ? { kind: "deactivate", room } : { kind: "room", room });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setEditing({ kind: "venue", venue: null })}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo edificio
        </Button>
      </div>

      {venues.length === 0 ? (
        <div className="rounded-xl border border-linea bg-white shadow-sm">
          <EmptyState
            icon={<Building2 className="h-8 w-8" aria-hidden="true" />}
            title="No hay edificios"
            action={
              <Button variant="primary" onClick={() => setEditing({ kind: "venue", venue: null })}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Crear el primer edificio
              </Button>
            }
          >
            Crea un edificio y después añade sus salas.
          </EmptyState>
        </div>
      ) : null}

      {venues.map((venue) => (
        <section
          key={venue.id}
          id={`edificio-${venue.id}`}
          aria-labelledby={`edificio-${venue.id}-titulo`}
          className="rounded-xl border border-linea bg-white shadow-sm"
        >
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-linea px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <h2 id={`edificio-${venue.id}-titulo`} className="flex items-center gap-2 font-sans text-base font-semibold tracking-normal">
                <Building2 className="h-4 w-4 shrink-0 text-mar-500" aria-hidden="true" />
                {venue.name}
              </h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-tinta-tenue">
                <Code>{venue.id}</Code>
                {venue.namePt ? <span lang="pt">PT: {venue.namePt}</span> : null}
                {venue.short ? <span>· corto: {venue.short}</span> : null}
                <span>· {plural(venue.rooms.length, "sala", "salas")}</span>
                {venue.sessionsCount ? (
                  <span>· {plural(venue.sessionsCount, "sesión de todo el edificio", "sesiones de todo el edificio")}</span>
                ) : null}
                <span>· orden {venue.order}</span>
              </p>
              {venue.subtitle || venue.address ? (
                <p className="mt-1 text-xs text-tinta-suave">{[venue.subtitle, venue.address].filter(Boolean).join(" · ")}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setEditing({ kind: "room", room: null, venueId: venue.id })}>
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Añadir sala
              </Button>
              <Button size="sm" onClick={() => setEditing({ kind: "venue", venue })}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Editar
                <span className="sr-only"> el edificio {venue.name}</span>
              </Button>
              <Button
                size="sm"
                variant="danger-ghost"
                onClick={() => setConfirming({ kind: "venue", venue })}
                disabled={venue.rooms.length > 0 || venue.sessionsCount > 0}
                title={
                  venue.rooms.length || venue.sessionsCount
                    ? "Solo se puede borrar un edificio sin salas ni sesiones"
                    : "Borrar el edificio"
                }
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Borrar
                <span className="sr-only"> el edificio {venue.name}</span>
              </Button>
            </div>
          </header>

          {venue.rooms.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <caption className="sr-only">Salas de {venue.name}</caption>
                <thead className="border-b border-linea bg-papel/70 text-xs uppercase tracking-wide text-tinta-tenue">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-medium sm:px-5">
                      Sala
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Código
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      Aforo
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Planta
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      Sesiones
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Activa
                    </th>
                    <th scope="col" className="w-px px-4 py-2 sm:px-5">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linea">
                  {venue.rooms.map((room) => (
                    <tr key={room.id} id={`sala-${room.id}`} className={cn("align-top", !room.active && "bg-papel/60")}>
                      <td className="px-4 py-3 sm:px-5">
                        <p className={cn("font-medium", room.active ? "text-tinta" : "text-tinta-tenue")}>
                          {room.name}
                          {room.accessible ? (
                            <span title="Accesible">
                              <Accessibility className="ml-1.5 inline h-3.5 w-3.5 text-mar-500" aria-hidden="true" />
                              <span className="sr-only"> (accesible)</span>
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-tinta-tenue">
                          <Code>{room.id}</Code>
                          {room.namePt ? <span lang="pt">PT: {room.namePt}</span> : null}
                          {room.equipment.length ? <span>· {plural(room.equipment.length, "equipo", "equipos")}</span> : null}
                        </p>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-tinta-suave">{room.code ?? "—"}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-tinta-suave">{room.capacity ?? "—"}</td>
                      <td className="px-3 py-3 text-tinta-suave">{room.floor ?? "—"}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-tinta-suave">{room.sessionsCount}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={room.active}
                            onChange={(v) => setActive(room, v)}
                            busy={busyRoom === room.id}
                            label={`${room.active ? "Desactivar" : "Activar"} ${room.name}`}
                          />
                          {room.active ? null : <Badge tone="warning">inactiva</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 sm:px-5">
                        <div className="flex justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditing({ kind: "room", room, venueId: room.venueId })}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Editar {room.name}</span>
                          </Button>
                          <Button
                            variant="danger-ghost"
                            size="icon-sm"
                            onClick={() => askDeleteRoom(room)}
                            title={room.sessionsCount ? "Tiene sesiones: se propondrá desactivarla" : "Borrar"}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Borrar {room.name}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={<DoorOpen className="h-7 w-7" aria-hidden="true" />} title="Este edificio no tiene salas">
              Añade una sala para poder asignarle sesiones.
            </EmptyState>
          )}
        </section>
      ))}

      {editing?.kind === "venue" ? (
        <VenueDialog
          venue={editing.venue}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      ) : null}
      {editing?.kind === "room" ? (
        <RoomDialog
          room={editing.room}
          venueId={editing.venueId}
          venues={venues}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={confirming !== null}
        title={
          confirming?.kind === "deactivate"
            ? "Esta sala tiene sesiones"
            : confirming?.kind === "venue"
              ? "¿Borrar el edificio?"
              : "¿Borrar la sala?"
        }
        confirmLabel={confirming?.kind === "deactivate" ? "Desactivar la sala" : "Borrar"}
        tone={confirming?.kind === "deactivate" ? "primary" : "danger"}
        onClose={() => setConfirming(null)}
        onConfirm={confirmAction}
      >
        {confirming?.kind === "deactivate" ? (
          confirming.room.active ? (
            <>
              <p>
                <strong className="text-tinta">{confirming.room.name}</strong> tiene{" "}
                {plural(confirming.room.sessionsCount, "sesión asignada", "sesiones asignadas")}, así que no se puede
                borrar.
              </p>
              <p>
                Puedes <strong className="text-tinta">desactivarla</strong>: deja de aparecer en la web pública y el
                validador avisará de sus sesiones para que las muevas.
              </p>
            </>
          ) : (
            <p>
              <strong className="text-tinta">{confirming.room.name}</strong> ya está desactivada pero sigue teniendo{" "}
              {plural(confirming.room.sessionsCount, "sesión", "sesiones")}. Mueve esas sesiones a otra ubicación para poder
              borrarla.
            </p>
          )
        ) : confirming?.kind === "room" ? (
          <p>
            Se borrará la sala <strong className="text-tinta">{confirming.room.name}</strong> (
            <Code>{confirming.room.id}</Code>). No tiene sesiones asignadas.
          </p>
        ) : confirming?.kind === "venue" ? (
          <p>
            Se borrará el edificio <strong className="text-tinta">{confirming.venue.name}</strong> (
            <Code>{confirming.venue.id}</Code>). No tiene salas ni sesiones.
          </p>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}

// ─── Diálogos de edición ──────────────────────────────────────────────

function useFieldErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  function show(issues: FieldIssue[], prefix: string) {
    setErrors(issuesToFieldErrors(issues));
    const first = issues[0]?.path;
    if (first) requestAnimationFrame(() => document.getElementById(`${prefix}-${first}`)?.focus());
  }
  return { errors, setErrors, show };
}

function IdPreview({ id, fromName, fallback }: { id?: string; fromName: string; fallback: string }) {
  return (
    <p className="text-xs text-tinta-tenue">
      Identificador:{" "}
      {id ? (
        <>
          <Code>{id}</Code> (no se puede cambiar)
        </>
      ) : (
        <>
          <Code>{slugify(fromName) || fallback}</Code> (se genera del nombre; si ya existe se le añade un número)
        </>
      )}
    </p>
  );
}

function VenueDialog({
  venue,
  onClose,
  onSaved,
}: {
  venue: VenueData | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: venue?.name ?? "",
    namePt: venue?.namePt ?? "",
    short: venue?.short ?? "",
    subtitle: venue?.subtitle ?? "",
    subtitlePt: venue?.subtitlePt ?? "",
    address: venue?.address ?? "",
    order: String(venue?.order ?? 0),
  });
  const [saving, setSaving] = useState(false);
  const { errors, show } = useFieldErrors();
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = venueInputSchema.safeParse(form);
    if (!parsed.success) {
      show(zodIssues(parsed.error), "vd");
      return;
    }
    setSaving(true);
    try {
      const { venue: saved } = await apiRequest<{ venue: VenueData }>(
        venue ? `/api/admin/venues/${venue.id}` : "/api/admin/venues",
        { method: venue ? "PUT" : "POST", body: form },
      );
      toast.success(venue ? "Edificio guardado." : `Edificio creado con el identificador «${saved.id}».`);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.issues.length) show(err.issues, "vd");
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const text = (key: keyof typeof form, label: string, opts: { required?: boolean; lang?: string; hint?: string } = {}) => (
    <Field id={`vd-${key}`} label={label} required={opts.required} error={errors[key]} hint={opts.hint}>
      <input
        {...describedBy(`vd-${key}`, { hint: opts.hint, error: errors[key] })}
        type="text"
        lang={opts.lang}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        className={inputClass}
      />
    </Field>
  );

  return (
    <Dialog
      open
      onClose={onClose}
      busy={saving}
      title={venue ? `Editar edificio: ${venue.name}` : "Nuevo edificio"}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="venue-form" variant="primary" busy={saving}>
            {venue ? "Guardar" : "Crear edificio"}
          </Button>
        </>
      }
    >
      <form id="venue-form" onSubmit={submit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {text("name", "Nombre (ES)", { required: true })}
          {text("namePt", "Nombre (PT)", { lang: "pt" })}
          {text("short", "Nombre corto", { hint: "Para la cabecera de la parrilla, p. ej. «IUCE»." })}
          <Field id="vd-order" label="Orden" error={errors.order} hint="Menor primero.">
            <input
              {...describedBy("vd-order", { hint: true, error: errors.order })}
              type="number"
              inputMode="numeric"
              step={1}
              value={form.order}
              onChange={(e) => set("order", e.target.value)}
              className={inputClass}
            />
          </Field>
          {text("subtitle", "Subtítulo (ES)", { hint: "p. ej. «Sesiones plenarias»." })}
          {text("subtitlePt", "Subtítulo (PT)", { lang: "pt" })}
        </div>
        {text("address", "Dirección")}
        <IdPreview id={venue?.id} fromName={form.name} fallback="edificio" />
      </form>
    </Dialog>
  );
}

function RoomDialog({
  room,
  venueId,
  venues,
  onClose,
  onSaved,
}: {
  room: RoomData | null;
  venueId: string;
  venues: VenueData[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    venueId: room?.venueId ?? venueId,
    name: room?.name ?? "",
    namePt: room?.namePt ?? "",
    code: room?.code ?? "",
    capacity: room?.capacity != null ? String(room.capacity) : "",
    floor: room?.floor ?? "",
    floorPt: room?.floorPt ?? "",
    description: room?.description ?? "",
    descriptionPt: room?.descriptionPt ?? "",
    equipment: (room?.equipment ?? []).join("\n"),
    imageUrl: room?.imageUrl ?? "",
    order: String(room?.order ?? 0),
    accessible: room?.accessible ?? true,
    active: room?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const { errors, show } = useFieldErrors();
  type TextKey = Exclude<keyof typeof form, "accessible" | "active">;
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = roomInputSchema.safeParse(form);
    if (!parsed.success) {
      show(zodIssues(parsed.error), "rd");
      return;
    }
    setSaving(true);
    try {
      const { room: saved } = await apiRequest<{ room: RoomData }>(room ? `/api/admin/rooms/${room.id}` : "/api/admin/rooms", {
        method: room ? "PUT" : "POST",
        body: form,
      });
      toast.success(room ? "Sala guardada." : `Sala creada con el identificador «${saved.id}».`);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.issues.length) show(err.issues, "rd");
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const text = (key: TextKey, label: string, opts: { required?: boolean; lang?: string; hint?: string; placeholder?: string } = {}) => (
    <Field id={`rd-${key}`} label={label} required={opts.required} error={errors[key]} hint={opts.hint}>
      <input
        {...describedBy(`rd-${key}`, { hint: opts.hint, error: errors[key] })}
        type="text"
        lang={opts.lang}
        value={form[key]}
        placeholder={opts.placeholder}
        onChange={(e) => set(key, e.target.value)}
        className={inputClass}
      />
    </Field>
  );

  const equipmentCount = form.equipment.split(/\r?\n/).filter((l) => l.trim()).length;
  const previewable = /^(https?:\/\/|\/(?!\/))\S+$/i.test(form.imageUrl.trim());

  return (
    <Dialog
      open
      onClose={onClose}
      busy={saving}
      size="lg"
      title={room ? `Editar sala: ${room.name}` : "Nueva sala"}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="room-form" variant="primary" busy={saving}>
            {room ? "Guardar" : "Crear sala"}
          </Button>
        </>
      }
    >
      <form id="room-form" onSubmit={submit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {text("name", "Nombre (ES)", { required: true })}
          {text("namePt", "Nombre (PT)", { lang: "pt" })}
          <Field id="rd-venueId" label="Edificio" required error={errors.venueId}>
            <select
              {...describedBy("rd-venueId", { error: errors.venueId })}
              value={form.venueId}
              onChange={(e) => set("venueId", e.target.value)}
              className={selectClass}
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </Field>
          {text("code", "Código", { placeholder: "IUCE-17A" })}
          <Field id="rd-capacity" label="Aforo" error={errors.capacity} hint="Personas. Vacío si no se sabe.">
            <input
              {...describedBy("rd-capacity", { hint: true, error: errors.capacity })}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field id="rd-order" label="Orden" error={errors.order} hint="Menor primero (columnas de la parrilla).">
            <input
              {...describedBy("rd-order", { hint: true, error: errors.order })}
              type="number"
              inputMode="numeric"
              step={1}
              value={form.order}
              onChange={(e) => set("order", e.target.value)}
              className={inputClass}
            />
          </Field>
          {text("floor", "Planta (ES)", { placeholder: "Planta baja" })}
          {text("floorPt", "Planta (PT)", { lang: "pt", placeholder: "Piso térreo" })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="rd-description" label="Descripción (ES)" error={errors.description}>
            <textarea
              {...describedBy("rd-description", { error: errors.description })}
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={textareaClass}
            />
          </Field>
          <Field id="rd-descriptionPt" label="Descripción (PT)" error={errors.descriptionPt}>
            <textarea
              {...describedBy("rd-descriptionPt", { error: errors.descriptionPt })}
              rows={3}
              lang="pt"
              value={form.descriptionPt}
              onChange={(e) => set("descriptionPt", e.target.value)}
              className={textareaClass}
            />
          </Field>
        </div>

        <Field
          id="rd-equipment"
          label="Equipamiento"
          hint="Uno por línea."
          aside={equipmentCount ? plural(equipmentCount, "elemento", "elementos") : undefined}
          error={errors.equipment}
        >
          <textarea
            {...describedBy("rd-equipment", { hint: true, error: errors.equipment })}
            rows={4}
            value={form.equipment}
            onChange={(e) => set("equipment", e.target.value)}
            placeholder={"Proyector HD\nPizarra blanca\nWi-Fi"}
            className={textareaClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[1fr,auto] sm:items-start">
          {text("imageUrl", "URL de imagen", {
            hint: "Ruta del sitio (/espacios/aula-17a.webp) o URL completa.",
            placeholder: "/espacios/…",
          })}
          {previewable ? (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa de una URL arbitraria
            <img
              key={form.imageUrl.trim()}
              src={form.imageUrl.trim()}
              alt=""
              className="h-20 w-32 rounded-lg border border-linea bg-papel object-cover"
              onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
            />
          ) : null}
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Checkbox
            id="rd-accessible"
            label="Accesible"
            description="Acceso sin barreras (silla de ruedas)."
            checked={form.accessible}
            onChange={(v) => set("accessible", v)}
          />
          <Checkbox
            id="rd-active"
            label="Activa"
            description="Las salas inactivas no aparecen en la web pública."
            checked={form.active}
            onChange={(v) => set("active", v)}
          />
        </div>

        <IdPreview id={room?.id} fromName={form.name} fallback="sala" />
      </form>
    </Dialog>
  );
}
