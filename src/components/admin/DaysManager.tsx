"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { CalendarPlus, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { ApiError, apiRequest, errorMessage } from "@/lib/admin/api-client";
import { issuesToFieldErrors, zodIssues } from "@/lib/admin/errors";
import { formatDayKey, plural, suggestDayLabels } from "@/lib/admin/format";
import { dayCreateSchema, dayUpdateSchema } from "@/lib/admin/schemas";
import type { DayRow } from "@/lib/admin/types";
import { ConfirmDialog } from "@/components/admin/Dialog";
import { Button, Field, describedBy, inputClass } from "@/components/admin/ui";

/**
 * Días del congreso: editar etiquetas ES/PT y orden, añadir y borrar. La
 * fecha (clave) no se edita; un día con sesiones no se puede borrar.
 */
export function DaysManager({ days }: { days: DayRow[] }) {
  const router = useRouter();
  const [toDelete, setToDelete] = useState<DayRow | null>(null);

  async function remove(day: DayRow) {
    try {
      await apiRequest(`/api/admin/days/${day.key}`, { method: "DELETE" });
      toast.success(`Día «${day.labelEs}» borrado.`);
      setToDelete(null);
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <div className="space-y-5">
      {days.length ? (
        <div className="overflow-x-auto rounded-lg border border-linea">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <caption className="sr-only">Días del congreso</caption>
            <thead className="border-b border-linea bg-papel/70 text-xs uppercase tracking-wide text-tinta-tenue">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Fecha
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Etiqueta (ES)
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Etiqueta (PT)
                </th>
                <th scope="col" className="w-20 px-3 py-2 font-medium">
                  Orden
                </th>
                <th scope="col" className="w-20 px-3 py-2 text-right font-medium">
                  Sesiones
                </th>
                <th scope="col" className="w-px px-3 py-2">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linea">
              {days.map((day) => (
                <DayRowEditor
                  key={`${day.key}|${day.labelEs}|${day.labelPt}|${day.order}`}
                  day={day}
                  onDelete={() => setToDelete(day)}
                  onSaved={() => router.refresh()}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-linea px-4 py-5 text-center text-sm text-tinta-tenue">
          No hay días. Añade los días del congreso para poder crear sesiones.
        </p>
      )}

      <NewDayForm
        nextOrder={days.reduce((max, d) => Math.max(max, d.order), -1) + 1}
        onCreated={() => router.refresh()}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="¿Borrar el día?"
        confirmLabel="Borrar día"
        onClose={() => setToDelete(null)}
        onConfirm={() => (toDelete ? remove(toDelete) : undefined)}
      >
        {toDelete ? (
          <p>
            Se borrará <strong className="text-tinta">{toDelete.labelEs}</strong> ({toDelete.key}). No tiene sesiones.
          </p>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}

function DayRowEditor({ day, onDelete, onSaved }: { day: DayRow; onDelete: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ labelEs: day.labelEs, labelPt: day.labelPt, order: String(day.order) });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const dirty = form.labelEs !== day.labelEs || form.labelPt !== day.labelPt || form.order !== String(day.order);
  const id = (field: string) => `day-${day.key}-${field}`;

  async function save() {
    const parsed = dayUpdateSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(issuesToFieldErrors(zodIssues(parsed.error)));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await apiRequest(`/api/admin/days/${day.key}`, { method: "PUT", body: form });
      toast.success(`Día ${day.key} guardado.`);
      onSaved();
    } catch (e) {
      if (e instanceof ApiError && e.issues.length) setErrors(issuesToFieldErrors(e.issues));
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  const cell = (field: "labelEs" | "labelPt" | "order", label: string) => (
    <td className="px-3 py-2">
      <label htmlFor={id(field)} className="sr-only">
        {label} del {day.key}
      </label>
      <input
        {...describedBy(id(field), { error: errors[field] })}
        type={field === "order" ? "number" : "text"}
        inputMode={field === "order" ? "numeric" : undefined}
        lang={field === "labelPt" ? "pt" : undefined}
        value={form[field]}
        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (dirty) void save();
          }
        }}
        className={cn(inputClass, "py-1.5")}
      />
      {errors[field] ? (
        <p id={`${id(field)}-error`} className="mt-1 text-xs font-medium text-red-700">
          {errors[field]}
        </p>
      ) : null}
    </td>
  );

  return (
    <tr className="align-top">
      <td className="whitespace-nowrap px-3 py-2">
        <p className="font-mono text-[0.8125rem] text-tinta">{day.key}</p>
        <p className="text-xs text-tinta-tenue">{formatDayKey(day.key)}</p>
      </td>
      {cell("labelEs", "Etiqueta en español")}
      {cell("labelPt", "Etiqueta en portugués")}
      {cell("order", "Orden")}
      <td className="px-3 py-2 pt-3.5 text-right tabular-nums text-tinta-suave">{day.sessionsCount}</td>
      <td className="px-3 py-2">
        <div className="flex justify-end gap-1">
          <Button size="sm" variant={dirty ? "primary" : "secondary"} onClick={save} busy={saving} disabled={!dirty}>
            {saving ? null : <Save className="h-3.5 w-3.5" aria-hidden="true" />}
            Guardar
            <span className="sr-only"> el {day.key}</span>
          </Button>
          <Button
            size="icon-sm"
            variant="danger-ghost"
            onClick={onDelete}
            disabled={day.sessionsCount > 0}
            title={
              day.sessionsCount > 0
                ? `No se puede borrar: tiene ${plural(day.sessionsCount, "sesión", "sesiones")}`
                : "Borrar el día"
            }
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Borrar el {day.key}</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}

function NewDayForm({ nextOrder, onCreated }: { nextOrder: number; onCreated: () => void }) {
  const empty = { key: "", labelEs: "", labelPt: "", order: String(nextOrder) };
  const [form, setForm] = useState(empty);
  const [suggested, setSuggested] = useState<{ es: string; pt: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function changeKey(key: string) {
    const next = suggestDayLabels(key);
    setForm((f) => ({
      ...f,
      key,
      // Propone etiquetas si están vacías o siguen siendo la propuesta anterior
      labelEs: next && (!f.labelEs || f.labelEs === suggested?.es) ? next.es : f.labelEs,
      labelPt: next && (!f.labelPt || f.labelPt === suggested?.pt) ? next.pt : f.labelPt,
    }));
    setSuggested(next);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = dayCreateSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(issuesToFieldErrors(zodIssues(parsed.error)));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await apiRequest("/api/admin/days", { method: "POST", body: form });
      toast.success(`Día ${form.key} añadido.`);
      setForm({ ...empty, order: String(nextOrder + 1) });
      setSuggested(null);
      onCreated();
    } catch (err) {
      if (err instanceof ApiError && err.issues.length) setErrors(issuesToFieldErrors(err.issues));
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-lg border border-dashed border-mar-200 bg-mar-50/40 p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-tinta">
        <CalendarPlus className="h-4 w-4 text-mar-600" aria-hidden="true" />
        Añadir un día
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[10rem,1fr,1fr,6rem,auto] lg:items-start">
        <Field id="nd-key" label="Fecha" required error={errors.key}>
          <input
            {...describedBy("nd-key", { error: errors.key })}
            type="date"
            value={form.key}
            onChange={(e) => changeKey(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field id="nd-labelEs" label="Etiqueta (ES)" required error={errors.labelEs}>
          <input
            {...describedBy("nd-labelEs", { error: errors.labelEs })}
            type="text"
            value={form.labelEs}
            onChange={(e) => setForm((f) => ({ ...f, labelEs: e.target.value }))}
            placeholder="Jueves 11 de febrero"
            className={inputClass}
          />
        </Field>
        <Field id="nd-labelPt" label="Etiqueta (PT)" required error={errors.labelPt}>
          <input
            {...describedBy("nd-labelPt", { error: errors.labelPt })}
            type="text"
            lang="pt"
            value={form.labelPt}
            onChange={(e) => setForm((f) => ({ ...f, labelPt: e.target.value }))}
            placeholder="Quinta-feira, 11 de fevereiro"
            className={inputClass}
          />
        </Field>
        <Field id="nd-order" label="Orden" error={errors.order}>
          <input
            {...describedBy("nd-order", { error: errors.order })}
            type="number"
            inputMode="numeric"
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
            className={inputClass}
          />
        </Field>
        <div className="flex items-end sm:col-span-2 lg:col-span-1 lg:h-full lg:pt-6">
          <Button type="submit" variant="primary" busy={saving}>
            Añadir día
          </Button>
        </div>
      </div>
      <p className="mt-2 text-xs text-tinta-tenue">
        Al elegir la fecha se proponen las etiquetas en los dos idiomas; puedes cambiarlas.
      </p>
    </form>
  );
}
