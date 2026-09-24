import { MapPin } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { dayLabel, sessionTitle, tr, type ProgrammeData } from "@/lib/programme";
import { sessionLocation, typeColor, typeLabel } from "@/lib/programme-format";

/** Programa resumido por días (portada). */
export function ProgrammeGlance({ data, locale }: { data: ProgrammeData; locale: Locale }) {
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-2">
      {data.days.map((day) => {
        const sessions = data.sessions.filter((s) => s.day === day.key);
        return (
          <article key={day.key} className="tarjeta overflow-hidden">
            <header className="flex items-center justify-between border-b border-linea bg-white px-6 py-4">
              <h3 className="font-display text-lg font-bold">{dayLabel(day, locale)}</h3>
              <span className="font-mono text-xs text-tinta-tenue">
                {sessions[0]?.start}–{sessions[sessions.length - 1]?.end}
              </span>
            </header>
            <ol className="relative px-6 py-5">
              <span className="absolute bottom-6 left-[5.35rem] top-6 w-px bg-linea" aria-hidden />
              {sessions.map((s) => {
                const loc = sessionLocation(s, data, locale);
                const color = typeColor(s);
                const muted = s.type === "PAUSA" || s.type === "ACREDITACION";
                return (
                  <li key={s.id} className="relative grid grid-cols-[4.25rem_1fr] gap-4 py-2.5">
                    <span className="pt-0.5 text-right font-mono text-sm tabular-nums text-tinta-suave">{s.start}</span>
                    <div className="relative pl-5">
                      <span
                        className="absolute left-[-0.3rem] top-[0.45rem] h-2.5 w-2.5 rounded-full ring-4 ring-white"
                        style={{ backgroundColor: color }}
                        aria-hidden
                      />
                      <p className={muted ? "text-sm text-tinta-tenue" : "font-medium leading-snug text-tinta"}>
                        {sessionTitle(s, locale)}
                        {s.cancelled && <span className="ml-2 text-xs font-semibold uppercase text-red-700">×</span>}
                      </p>
                      {!muted && (
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          <span className="font-medium" style={{ color }}>
                            {typeLabel(s, locale)}
                          </span>
                          {loc && (
                            <span className="inline-flex items-center gap-1 text-tinta-tenue">
                              <MapPin className="h-3 w-3" aria-hidden />
                              {loc.label}
                            </span>
                          )}
                          {s.subtitle && <span className="text-tinta-tenue">· {tr(s.subtitle, s.subtitlePt, locale)}</span>}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </article>
        );
      })}
    </div>
  );
}
