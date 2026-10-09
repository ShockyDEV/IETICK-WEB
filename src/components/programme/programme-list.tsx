"use client";

import { MapPin } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { tr, type ProgrammeData } from "@/lib/programme";
import { sessionLocation } from "@/lib/programme-format";
import { SESSION_TYPE_META } from "@/lib/session-types";
import { sessionState } from "@/lib/time";
import { cn } from "@/lib/cn";
import type { ProgrammeStrings } from "./i18n";
import { LiveBadge } from "./programme-grid";
import { StarButton } from "./star-button";
import { rgba } from "./utils";

/**
 * Vista del programa en todas las pantallas: feed cronológico de tarjetas
 * agrupadas por hora de inicio, cada una con su sala. En pantallas anchas, las
 * actividades que empiezan a la misma hora se ponen una al lado de otra.
 */
export function ProgrammeList({
  data,
  dayKey,
  locale,
  t,
  now,
  archive,
  agenda,
  onToggleAgenda,
  onOpen,
}: {
  data: ProgrammeData;
  dayKey: string;
  locale: Locale;
  t: ProgrammeStrings;
  now: Date | null;
  archive: boolean;
  agenda: Set<string>;
  onToggleAgenda: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const sessions = data.sessions.filter((s) => s.day === dayKey);
  if (!sessions.length) {
    return <p className="rounded-lg border border-dashed border-linea p-8 text-center text-tinta-suave">{t.noSessions}</p>;
  }

  const groups = new Map<string, typeof sessions>();
  for (const s of sessions) groups.set(s.start, [...(groups.get(s.start) ?? []), s]);

  return (
    <ol className="space-y-6">
      {[...groups.entries()].map(([start, list]) => (
        <li key={start} className="grid grid-cols-[3.5rem_1fr] gap-3 lg:grid-cols-[5rem_1fr] lg:gap-5">
          <p className="pt-3 text-right text-sm font-semibold tabular-nums text-tinta-suave lg:text-base">{start}</p>
          <ul className={cn("grid gap-2.5", list.length > 1 && "md:grid-cols-2")}>
            {list.map((s) => {
              const meta = SESSION_TYPE_META[s.type];
              const state = now ? sessionState(s, now) : "future";
              const paint = archive && state === "past" ? "idle" : state;
              const loc = sessionLocation(s, data, locale);
              const logistic = s.type === "PAUSA" || s.type === "ACREDITACION";
              const title = tr(s.title, s.titlePt, locale);

              if (logistic && !s.description) {
                return (
                  <li
                    key={s.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border border-dashed border-linea bg-papel px-4 py-2.5 text-sm text-tinta-suave",
                      paint === "past" && "opacity-55",
                    )}
                  >
                    <span className="font-medium">{title}</span>
                    <span className="text-xs tabular-nums text-tinta-tenue">
                      {s.start}–{s.end}
                    </span>
                  </li>
                );
              }

              return (
                <li key={s.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpen(s.id)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(s.id))}
                    className={cn(
                      "relative flex gap-3 overflow-hidden rounded-lg border bg-white p-4 pl-5 shadow-tarjeta transition active:scale-[0.99]",
                      paint === "live" && "ring-2 ring-oro-400",
                      paint === "past" && "opacity-60",
                    )}
                    style={{ borderColor: rgba(meta.color, 0.25) }}
                  >
                    <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: meta.color }} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold uppercase tracking-wide" style={{ color: meta.color }}>
                          {meta.label[locale]}
                        </span>
                        <span className="tabular-nums text-tinta-tenue">
                          {s.start}–{s.end}
                        </span>
                        {paint === "live" && <LiveBadge t={t} />}
                        {s.cancelled && <span className="font-semibold uppercase text-red-700">{t.cancelled}</span>}
                      </p>
                      <p className={cn("mt-1 font-display text-base font-semibold leading-snug", s.cancelled && "line-through")}>{title}</p>
                      {s.subtitle && <p className="mt-0.5 text-sm text-tinta-suave">{tr(s.subtitle, s.subtitlePt, locale)}</p>}
                      {loc && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-mar-700">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {loc.label}
                        </p>
                      )}
                    </div>
                    <StarButton
                      active={agenda.has(s.id)}
                      onToggle={() => onToggleAgenda(s.id)}
                      label={agenda.has(s.id) ? t.removeFromAgenda : t.addToAgenda}
                      size="md"
                      className="-mr-2 -mt-2"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}
