"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { EJES } from "@/content/ejes";
import { cn } from "@/lib/cn";
import { Button, Field, describedBy, inputClass, selectClass, textareaClass } from "@/components/admin/ui";

/**
 * Editor de contribuciones (Talk) de una sesión: añadir, quitar y reordenar
 * (subir/bajar), con título, autores, quién presenta, resumen y eje
 * temático. Los cambios se guardan con el resto del formulario.
 */

export interface TalkDraft {
  /** Clave local estable (React). */
  key: string;
  /** Id en la BD (null si aún no se ha guardado). */
  id: string | null;
  title: string;
  authors: string;
  presenter: string;
  abstract: string;
  axis: string;
}

let seq = 0;
export function newTalkKey(): string {
  seq += 1;
  return `nueva-${Date.now().toString(36)}-${seq}`;
}

export function emptyTalk(): TalkDraft {
  return { key: newTalkKey(), id: null, title: "", authors: "", presenter: "", abstract: "", axis: "" };
}

/** Id del control de un campo de una contribución (para enfocar errores). */
export function talkFieldId(key: string, field: keyof Omit<TalkDraft, "key" | "id">): string {
  return `sf-talk-${key}-${field}`;
}

interface Props {
  talks: TalkDraft[];
  onChange: (talks: TalkDraft[]) => void;
  /** Errores por ruta: "talks.0.title" → mensaje. */
  errors: Record<string, string>;
  disabled?: boolean;
}

export function TalksEditor({ talks, onChange, errors, disabled }: Props) {
  const [announcement, setAnnouncement] = useState("");

  function update(index: number, patch: Partial<TalkDraft>) {
    onChange(talks.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function add() {
    const talk = emptyTalk();
    onChange([...talks, talk]);
    setAnnouncement(`Contribución ${talks.length + 1} añadida.`);
    // Enfoca el título de la nueva contribución tras pintarla
    requestAnimationFrame(() => document.getElementById(talkFieldId(talk.key, "title"))?.focus());
  }

  function remove(index: number) {
    const title = talks[index]?.title.trim();
    onChange(talks.filter((_, i) => i !== index));
    setAnnouncement(`Contribución ${index + 1}${title ? ` «${title}»` : ""} quitada. Se aplicará al guardar.`);
    requestAnimationFrame(() => {
      const next = talks[index + 1] ?? talks[index - 1];
      const target = next ? document.getElementById(talkFieldId(next.key, "title")) : null;
      (target ?? document.getElementById("sf-talks-add"))?.focus();
    });
  }

  function move(index: number, delta: -1 | 1) {
    const to = index + delta;
    if (to < 0 || to >= talks.length) return;
    const next = [...talks];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    onChange(next);
    setAnnouncement(`Contribución movida a la posición ${to + 1} de ${talks.length}.`);
    // Mantiene el foco en el mismo botón (o en el contrario si llega a un extremo)
    requestAnimationFrame(() => {
      const edge = (delta < 0 && to === 0) || (delta > 0 && to === talks.length - 1);
      const which = edge ? (delta < 0 ? "down" : "up") : delta < 0 ? "up" : "down";
      document.getElementById(`sf-talk-${item.key}-${which}`)?.focus();
    });
  }

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {talks.length ? (
        <ol className="space-y-3">
          {talks.map((talk, index) => {
            const err = (field: string) => errors[`talks.${index}.${field}`];
            const titleId = talkFieldId(talk.key, "title");
            return (
              <li key={talk.key} className="rounded-lg border border-linea bg-papel/50 p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-tinta-tenue">
                    Contribución {index + 1}
                    {talk.id ? null : <span className="ml-2 normal-case tracking-normal text-mar-600">(nueva)</span>}
                  </p>
                  <div className="flex gap-0.5">
                    <Button
                      id={`sf-talk-${talk.key}-up`}
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(index, -1)}
                      disabled={disabled || index === 0}
                      title="Subir"
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Subir la contribución {index + 1}</span>
                    </Button>
                    <Button
                      id={`sf-talk-${talk.key}-down`}
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(index, 1)}
                      disabled={disabled || index === talks.length - 1}
                      title="Bajar"
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Bajar la contribución {index + 1}</span>
                    </Button>
                    <Button
                      variant="danger-ghost"
                      size="icon-sm"
                      onClick={() => remove(index)}
                      disabled={disabled}
                      title="Quitar"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Quitar la contribución {index + 1}</span>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id={titleId} label="Título" required error={err("title")} className="sm:col-span-2">
                    <input
                      {...describedBy(titleId, { error: err("title") })}
                      type="text"
                      value={talk.title}
                      onChange={(e) => update(index, { title: e.target.value })}
                      disabled={disabled}
                      maxLength={500}
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    id={talkFieldId(talk.key, "authors")}
                    label="Autores"
                    hint="Separados por comas: Nombre Apellido (Universidad)"
                    error={err("authors")}
                  >
                    <input
                      {...describedBy(talkFieldId(talk.key, "authors"), {
                        hint: true,
                        error: err("authors"),
                      })}
                      type="text"
                      value={talk.authors}
                      onChange={(e) => update(index, { authors: e.target.value })}
                      disabled={disabled}
                      className={inputClass}
                    />
                  </Field>
                  <Field id={talkFieldId(talk.key, "presenter")} label="Presenta" error={err("presenter")}>
                    <input
                      {...describedBy(talkFieldId(talk.key, "presenter"), { error: err("presenter") })}
                      type="text"
                      value={talk.presenter}
                      onChange={(e) => update(index, { presenter: e.target.value })}
                      disabled={disabled}
                      className={inputClass}
                    />
                  </Field>
                  <Field id={talkFieldId(talk.key, "axis")} label="Eje temático" error={err("axis")} className="sm:col-span-2">
                    <select
                      {...describedBy(talkFieldId(talk.key, "axis"), { error: err("axis") })}
                      value={talk.axis}
                      onChange={(e) => update(index, { axis: e.target.value })}
                      disabled={disabled}
                      className={selectClass}
                    >
                      <option value="">— Sin eje —</option>
                      {EJES.map((eje) => (
                        <option key={eje.id} value={eje.id}>
                          {eje.title.es}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id={talkFieldId(talk.key, "abstract")} label="Resumen" error={err("abstract")} className="sm:col-span-2">
                    <textarea
                      {...describedBy(talkFieldId(talk.key, "abstract"), { error: err("abstract") })}
                      rows={3}
                      value={talk.abstract}
                      onChange={(e) => update(index, { abstract: e.target.value })}
                      disabled={disabled}
                      className={cn(textareaClass, "min-h-[4.5rem]")}
                    />
                  </Field>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="rounded-lg border border-dashed border-linea px-4 py-5 text-center text-sm text-tinta-tenue">
          Esta sesión no tiene contribuciones. Añádelas para las mesas de comunicaciones o de proyectos.
        </p>
      )}

      <Button id="sf-talks-add" onClick={add} disabled={disabled} className="mt-3">
        <Plus className="h-4 w-4" aria-hidden="true" />
        Añadir contribución
      </Button>
    </div>
  );
}
