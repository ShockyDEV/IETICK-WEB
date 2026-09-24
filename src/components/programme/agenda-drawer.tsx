"use client";

import { useEffect, useRef } from "react";
import { MapPin, Star, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { dayLabel, tr, type ProgrammeData } from "@/lib/programme";
import { sessionLocation } from "@/lib/programme-format";
import { SESSION_TYPE_META } from "@/lib/session-types";
import { sessionState } from "@/lib/time";
import { cn } from "@/lib/cn";
import type { ProgrammeStrings } from "./i18n";
import { LiveBadge } from "./programme-grid";
import { StarButton } from "./star-button";

/** Panel lateral «Mi agenda»: sesiones marcadas con estrella, por día. */
export function AgendaDrawer({
  open,
  data,
  locale,
  t,
  now,
  agenda,
  onToggleAgenda,
  onOpenSession,
  onClose,
}: {
  open: boolean;
  data: ProgrammeData;
  locale: Locale;
  t: ProgrammeStrings;
  now: Date | null;
  agenda: Set<string>;
  onToggleAgenda: (id: string) => void;
  onOpenSession: (id: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const saved = data.sessions.filter((s) => agenda.has(s.id));

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="agenda-titulo"
      className="m-0 ml-auto h-full max-h-none w-full max-w-md bg-transparent p-0 backdrop:bg-noche-950/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col bg-white shadow-elevada">
        <header className="flex items-center justify-between border-b border-linea px-6 py-5">
          <h2 id="agenda-titulo" className="flex items-center gap-2 font-display text-xl font-bold">
            <Star className="h-5 w-5 text-oro-500" fill="currentColor" aria-hidden />
            {t.agendaTitle}
            <span className="font-mono text-sm font-normal text-tinta-tenue">({saved.length})</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-tinta-suave hover:bg-papel"
            aria-label={t.close}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>
        <div className="scrollbar-fino flex-1 overflow-y-auto px-6 py-5">
          {saved.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-linea p-6 text-sm leading-relaxed text-tinta-suave">{t.agendaEmpty}</p>
          ) : (
            data.days.map((day) => {
              const list = saved.filter((s) => s.day === day.key);
              if (!list.length) return null;
              return (
                <section key={day.key} className="mb-6">
                  <h3 className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-mar-600">{dayLabel(day, locale)}</h3>
                  <ul className="mt-3 space-y-2">
                    {list.map((s) => {
                      const meta = SESSION_TYPE_META[s.type];
                      const loc = sessionLocation(s, data, locale);
                      const live = !!now && sessionState(s, now) === "live";
                      return (
                        <li key={s.id}>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => onOpenSession(s.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onOpenSession(s.id);
                              }
                            }}
                            className={cn(
                              "relative flex gap-3 rounded-xl border border-linea p-3 pl-4 transition hover:border-mar-300",
                              live && "ring-2 ring-oro-400",
                            )}
                          >
                            <span className="absolute inset-y-2 left-0 w-1 rounded-full" style={{ backgroundColor: meta.color }} aria-hidden />
                            <div className="min-w-0 flex-1">
                              <p className="flex items-center gap-2 font-mono text-xs tabular-nums text-tinta-tenue">
                                {s.start}–{s.end} {live && <LiveBadge t={t} />}
                              </p>
                              <p className="mt-0.5 font-medium leading-snug">{tr(s.title, s.titlePt, locale)}</p>
                              {loc && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-tinta-tenue">
                                  <MapPin className="h-3 w-3" aria-hidden /> {loc.label}
                                </p>
                              )}
                            </div>
                            <StarButton active onToggle={() => onToggleAgenda(s.id)} label={t.removeFromAgenda} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })
          )}
        </div>
      </div>
    </dialog>
  );
}
