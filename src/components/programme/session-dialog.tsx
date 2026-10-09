"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Clock, Globe2, Link2, MapPin, Mic2, Radio, Star, Users, X } from "lucide-react";
import { EJES } from "@/content/ejes";
import { href, pick, type Locale } from "@/lib/i18n";
import { dayLabel, speakerList, tr, type ProgrammeData, type ProgrammeSession } from "@/lib/programme";
import { sessionLocation } from "@/lib/programme-format";
import { SESSION_TYPE_META } from "@/lib/session-types";
import { formatInZone, formatOffset, hmToMinutes, offsetVsMadrid, sessionState } from "@/lib/time";
import { cn } from "@/lib/cn";
import type { ProgrammeStrings } from "./i18n";
import { LiveBadge } from "./programme-grid";

/** Ficha de sesión en un <dialog> nativo (foco atrapado y Esc de serie). */
export function SessionDialog({
  session,
  data,
  locale,
  t,
  now,
  timeZone,
  starred,
  onToggleAgenda,
  onCopyLink,
  onClose,
}: {
  session: ProgrammeSession | null;
  data: ProgrammeData;
  locale: Locale;
  t: ProgrammeStrings;
  now: Date | null;
  timeZone: string | null;
  starred: boolean;
  onToggleAgenda: () => void;
  onCopyLink: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (session && !d.open) d.showModal();
    if (!session && d.open) d.close();
  }, [session]);

  const s = session;
  const meta = s ? SESSION_TYPE_META[s.type] : null;
  const day = s ? data.days.find((d) => d.key === s.day) : null;
  const loc = s ? sessionLocation(s, data, locale) : null;
  const state = s && now ? sessionState(s, now) : null;
  const offset = s && timeZone ? offsetVsMadrid(s.day, s.start, timeZone) : 0;
  const speakers = s ? speakerList(s) : [];
  const duration = s ? hmToMinutes(s.end) - hmToMinutes(s.start) : 0;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="sesion-titulo"
      className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-noche-950/60 backdrop:backdrop-blur-sm sm:m-auto sm:h-fit sm:max-h-[88vh] sm:max-w-2xl"
    >
      {s && meta && (
        <div className="flex h-full flex-col overflow-hidden bg-white shadow-elevada sm:h-auto sm:max-h-[88vh] sm:rounded-xl">
          <div className="h-1.5 shrink-0" style={{ backgroundColor: meta.color }} aria-hidden />
          <header className="flex shrink-0 items-start justify-between gap-4 px-6 pb-2 pt-5 sm:px-8">
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: meta.color }}>
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: meta.color }} aria-hidden />
                {meta.label[locale]}
              </span>
              {state === "live" && <LiveBadge t={t} />}
              {s.cancelled && <span className="rounded-sm bg-red-50 px-2 py-0.5 text-xs font-semibold uppercase text-red-700">{t.cancelled}</span>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 -mt-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-tinta-suave transition hover:bg-papel hover:text-tinta"
              aria-label={t.close}
              autoFocus
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </header>

          <div className="scrollbar-fino min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-8">
            <h2 id="sesion-titulo" className={cn("font-display text-2xl font-bold leading-tight sm:text-3xl", s.cancelled && "line-through")}>
              {tr(s.title, s.titlePt, locale)}
            </h2>
            {s.subtitle && <p className="mt-2 text-lg text-tinta-suave">{tr(s.subtitle, s.subtitlePt, locale)}</p>}

            <dl className="mt-6 space-y-3 rounded-lg bg-papel p-4 text-sm">
              <div className="flex gap-3">
                <dt className="sr-only">{t.madridTime}</dt>
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-mar-600" aria-hidden />
                <dd>
                  <span className="font-medium text-tinta">{day ? dayLabel(day, locale) : s.day}</span>,{" "}
                  <span className="font-medium tabular-nums">
                    {s.start}–{s.end}
                  </span>{" "}
                  <span className="text-tinta-tenue">
                    ({t.madridTime}, {duration} {t.minutes})
                  </span>
                </dd>
              </div>
              {timeZone && offset !== 0 && (
                <div className="flex gap-3">
                  <dt className="sr-only">{t.yourTime}</dt>
                  <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-mar-600" aria-hidden />
                  <dd>
                    {t.yourTime}:{" "}
                    <span className="font-medium tabular-nums text-tinta">
                      {formatInZone(s.day, s.start, timeZone)}–{formatInZone(s.day, s.end, timeZone)}
                    </span>{" "}
                    <span className="text-tinta-tenue">
                      ({timeZone.split("/").pop()?.replace(/_/g, " ")}, {formatOffset(offset)})
                    </span>
                  </dd>
                </div>
              )}
              {loc && (
                <div className="flex gap-3">
                  <dt className="sr-only">{t.where}</dt>
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mar-600" aria-hidden />
                  <dd>
                    <span className="font-medium text-tinta">{loc.label}</span>
                    {loc.room?.capacity ? <span className="text-tinta-tenue"> ({t.capacity(loc.room.capacity)})</span> : null}
                    {loc.venue && loc.scope === "room" && (
                      <span className="block text-tinta-tenue">{tr(loc.venue.name, loc.venue.namePt, locale)}</span>
                    )}
                    {(loc.room || loc.venue) && (
                      <Link href={`${href(locale, "/sede")}#como-llegar`} className="enlace mt-1 inline-block text-xs" onClick={onClose}>
                        {t.seeVenue}
                      </Link>
                    )}
                    {/* Lugares fuera de la sede (p. ej. la Biblioteca histórica): enlace al mapa */}
                    {loc.scope === "global" && s.location && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.location}, Salamanca`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="enlace mt-1 inline-block text-xs"
                      >
                        {t.seeOnMap}
                      </a>
                    )}
                  </dd>
                </div>
              )}
            </dl>

            {speakers.length > 0 && (
              <section className="mt-6">
                <h3 className="nota flex items-center gap-2 text-tinta-suave">
                  <Mic2 className="h-4 w-4 text-mar-600" aria-hidden /> {t.speakers}
                </h3>
                <ul className="mt-2 space-y-1">
                  {speakers.map((p) => (
                    <li key={p} className="font-medium text-tinta">
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {s.chair && (
              <p className="mt-4 flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-tinta-tenue" aria-hidden />
                <span className="text-tinta-tenue">{t.chair}:</span> <span className="font-medium">{s.chair}</span>
              </p>
            )}

            {s.description && (
              <div className="prosa mt-6 text-base">
                {tr(s.description, s.descriptionPt, locale)
                  .split(/\n{2,}/)
                  .map((p) => (
                    <p key={p.slice(0, 32)}>{p}</p>
                  ))}
              </div>
            )}

            {s.talks.length > 0 && (
              <section className="mt-8">
                <h3 className="nota text-tinta-suave">
                  {s.type === "TALLER" ? t.workshops : s.type === "MESA_REDONDA" ? t.experiences : t.contributions} ({s.talks.length})
                </h3>
                <ol className="mt-3 divide-y divide-linea rounded-lg border border-linea">
                  {s.talks.map((talk) => {
                    const eje = EJES.find((e) => e.id === talk.axis);
                    return (
                      <li key={talk.id} className="p-4">
                        <p className="font-medium leading-snug text-tinta">{talk.title}</p>
                        {(talk.authors || talk.presenter) && (
                          <p className="mt-1 text-sm text-tinta-suave">
                            {talk.authors}
                            {talk.presenter && (
                              <span className="block text-tinta-tenue">
                                {t.presenter}: {talk.presenter}
                              </span>
                            )}
                          </p>
                        )}
                        {eje && (
                          <p className="mt-2 text-xs text-mar-700">
                            {t.axis}: {pick(eje.short, locale)}
                          </p>
                        )}
                        {talk.abstract && (
                          <details className="mt-2 text-sm text-tinta-suave">
                            <summary className="cursor-pointer font-medium text-mar-600">{t.abstract}</summary>
                            <p className="mt-2 leading-relaxed">{talk.abstract}</p>
                          </details>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            {s.streamUrl && /^https?:\/\//.test(s.streamUrl) && (
              <a href={s.streamUrl} target="_blank" rel="noopener noreferrer" className="boton-mar mt-6">
                <Radio className="h-4 w-4" aria-hidden /> {t.stream}
              </a>
            )}
          </div>

          <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-linea bg-white px-6 py-4 sm:px-8">
            <button
              type="button"
              onClick={onToggleAgenda}
              aria-pressed={starred}
              className={cn(
                starred
                  ? "boton text-oro-800 [--boton-fondo:theme(colors.oro.100)] hover:[--boton-fondo:theme(colors.oro.200)]"
                  : "boton-contorno hover:[--boton-borde:theme(colors.oro.400)]",
              )}
            >
              <Star className="h-4 w-4" fill={starred ? "currentColor" : "none"} aria-hidden />
              {starred ? t.removeFromAgenda : t.addToAgenda}
            </button>
            <button type="button" onClick={onCopyLink} className="boton-contorno">
              <Link2 className="h-4 w-4" aria-hidden />
              {t.copyLink}
            </button>
          </footer>
        </div>
      )}
    </dialog>
  );
}
