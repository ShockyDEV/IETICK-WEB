"use client";

import { useMemo } from "react";
import { Radio } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { tr, type ProgrammeData, type ProgrammeSession } from "@/lib/programme";
import { SESSION_TYPE_META } from "@/lib/session-types";
import { minutesToHm, sessionState, zonedParts, type SessionState } from "@/lib/time";
import { cn } from "@/lib/cn";
import { buildColumns, placeSessions, timeRange, type PlacedSession } from "./grid-layout";
import type { ProgrammeStrings } from "./i18n";
import { StarButton } from "./star-button";
import { rgba } from "./utils";

const TIME_COL = "4.25rem";
const SLOT_PX = 54; // alto de media hora
const PX_PER_MIN = SLOT_PX / 30;
const PAD = 14; // margen superior e inferior del cuerpo (que se lea la primera hora)

interface Props {
  data: ProgrammeData;
  dayKey: string;
  locale: Locale;
  t: ProgrammeStrings;
  now: Date | null;
  archive: boolean;
  agenda: Set<string>;
  onToggleAgenda: (id: string) => void;
  onOpen: (id: string) => void;
}

/** Parrilla de escritorio: columnas = salas agrupadas por edificio; filas = tiempo. */
export function ProgrammeGrid({ data, dayKey, locale, t, now, archive, agenda, onToggleAgenda, onOpen }: Props) {
  const { columns, bands } = useMemo(() => buildColumns(data), [data]);
  const daySessions = useMemo(() => data.sessions.filter((s) => s.day === dayKey), [data, dayKey]);
  const placed = useMemo(() => placeSessions(daySessions, columns, bands), [daySessions, columns, bands]);
  const range = useMemo(() => timeRange(daySessions), [daySessions]);

  if (!daySessions.length) {
    return <p className="rounded-lg border border-dashed border-linea p-10 text-center text-tinta-suave">{t.noSessions}</p>;
  }

  const n = Math.max(1, columns.length);
  const height = (range.end - range.start) * PX_PER_MIN + PAD * 2;
  const slots = (range.end - range.start) / 30;
  const gridCols = `${TIME_COL} repeat(${n}, minmax(0, 1fr))`;

  const nowParts = now ? zonedParts(now) : null;
  const showNow =
    !!nowParts && nowParts.dayKey === dayKey && nowParts.minutes >= range.start && nowParts.minutes <= range.end;

  const leftFor = (col: number) => `calc(${TIME_COL} + (100% - ${TIME_COL}) * ${col} / ${n})`;
  const widthFor = (span: number) => `calc((100% - ${TIME_COL}) * ${span} / ${n})`;

  // Orden de pintado: filas generales y de edificio debajo, sesiones de sala encima
  const ordered = [...placed].sort((a, b) => rank(a) - rank(b));

  return (
    <div className="rounded-xl border border-linea bg-white shadow-tarjeta">
      {/* Cabecera fija: una franja propia con los edificios y, debajo, las salas */}
      <div
        className="sticky z-30 rounded-t-xl border-b border-linea bg-white/95 backdrop-blur"
        style={{ top: "calc(var(--header-h) + var(--toolbar-h, 0px))" }}
      >
        <div className="grid rounded-t-xl bg-noche-900 text-white" style={{ gridTemplateColumns: gridCols }}>
          <div />
          {bands.map((b) => (
            <div
              key={b.venue.id}
              className="flex min-w-0 items-baseline gap-x-3 border-l border-white/10 px-3 py-2.5"
              style={{ gridColumn: `${b.start + 2} / span ${b.span}` }}
            >
              <p className="truncate font-display text-[0.9rem] font-semibold">{tr(b.venue.name, b.venue.namePt, locale)}</p>
              {b.venue.subtitle && b.span > 1 && (
                <p className="truncate font-serif text-[1.05rem] italic leading-none text-cian-200/85">
                  {tr(b.venue.subtitle, b.venue.subtitlePt, locale)}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: gridCols }}>
          <div />
          {columns.map((c) => (
            <div key={c.room.id} className="border-l border-linea px-3 pb-2.5 pt-2">
              <p className="truncate font-display text-[0.95rem] font-semibold text-tinta">{tr(c.room.name, c.room.namePt, locale)}</p>
              {c.room.capacity ? <p className="text-xs text-tinta-tenue">{t.capacity(c.room.capacity)}</p> : null}
            </div>
          ))}
        </div>
      </div>

      {/* Cuerpo */}
      <div className="relative" style={{ height }} role="table" aria-label={t.days}>
        {/* líneas horizontales y etiquetas de hora */}
        {Array.from({ length: slots + 1 }).map((_, i) => {
          const m = range.start + i * 30;
          const hour = m % 60 === 0;
          return (
            <div key={m} className="pointer-events-none absolute inset-x-0" style={{ top: PAD + i * SLOT_PX }} aria-hidden>
              <div
                className={cn("absolute right-0 border-t", hour ? "border-linea" : "border-dashed border-linea/70")}
                style={{ left: TIME_COL }}
              />
              {i < slots && (
                <span
                  className={cn(
                    "absolute -translate-y-1/2 pl-3 tabular-nums",
                    hour ? "text-xs font-semibold text-tinta-suave" : "text-[0.68rem] text-tinta-tenue/80",
                  )}
                  style={{ top: 0, left: 0 }}
                >
                  {minutesToHm(m)}
                </span>
              )}
            </div>
          );
        })}

        {/* separadores de columna */}
        {columns.map((c) => (
          <div
            key={c.room.id}
            className={cn("pointer-events-none absolute inset-y-0 border-l", bands.some((b) => b.start === c.index) ? "border-linea" : "border-linea/60")}
            style={{ left: leftFor(c.index) }}
            aria-hidden
          />
        ))}

        {/* sesiones */}
        {ordered.map((p) => {
          const state: SessionState | "idle" = now ? sessionState(p.session, now) : "idle";
          const paint = archive && state === "past" ? "idle" : state;
          const top = PAD + (p.startMin - range.start) * PX_PER_MIN;
          const h = (p.endMin - p.startMin) * PX_PER_MIN;
          const laneW = `calc((${widthFor(p.span)}) / ${p.lanes})`;
          const style: React.CSSProperties = {
            top: top + 3,
            height: Math.max(h - 6, 26),
            left: `calc(${leftFor(p.col)} + (${laneW}) * ${p.lane} + 5px)`,
            width: `calc(${laneW} - 10px)`,
          };
          return (
            <SessionBlock
              key={p.session.id}
              placed={p}
              style={style}
              paint={paint}
              heightPx={h}
              locale={locale}
              t={t}
              starred={agenda.has(p.session.id)}
              onToggleAgenda={() => onToggleAgenda(p.session.id)}
              onOpen={() => onOpen(p.session.id)}
              roomColumns={p.kind === "venue" ? p.span : 0}
            />
          );
        })}

        {/* línea de «ahora» */}
        {showNow && nowParts && (
          <div
            className="pointer-events-none absolute right-0 z-[29]"
            style={{ top: PAD + (nowParts.minutes - range.start) * PX_PER_MIN, left: 0 }}
            aria-hidden
          >
            <div className="absolute right-0 border-t-2 border-oro-500" style={{ left: TIME_COL }} />
            <span className="absolute -translate-y-1/2 bg-oro-400 py-0.5 pl-2 pr-3 text-[0.7rem] font-semibold tabular-nums text-noche-900 [clip-path:polygon(0_0,calc(100%-7px)_0,100%_50%,calc(100%-7px)_100%,0_100%)]">
              {nowParts.label}
            </span>
            <span className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 animate-latido rounded-full bg-oro-500" style={{ left: TIME_COL }} />
          </div>
        )}
      </div>
    </div>
  );
}

function rank(p: PlacedSession) {
  return p.kind === "global" ? 0 : p.kind === "venue" ? 1 : 2;
}

function SessionBlock({
  placed,
  style,
  paint,
  heightPx,
  locale,
  t,
  starred,
  onToggleAgenda,
  onOpen,
  roomColumns,
}: {
  placed: PlacedSession;
  style: React.CSSProperties;
  paint: SessionState | "idle";
  heightPx: number;
  locale: Locale;
  t: ProgrammeStrings;
  starred: boolean;
  onToggleAgenda: () => void;
  onOpen: () => void;
  roomColumns: number;
}) {
  const s = placed.session;
  const meta = SESSION_TYPE_META[s.type];
  const title = tr(s.title, s.titlePt, locale);
  const subtitle = s.subtitle ? tr(s.subtitle, s.subtitlePt, locale) : null;
  const logistic = placed.kind === "global" && (s.type === "PAUSA" || s.type === "ACREDITACION");
  const hasDetail = !!(s.description || s.speakers || s.talks.length || s.location || s.streamUrl);
  const clickable = !logistic || hasDetail;
  const compact = heightPx < 70;

  const a11y = `${meta.label[locale]}: ${title}, ${s.start}–${s.end}${paint === "live" ? `, ${t.live}` : ""}`;

  // Franja general (pausas, acreditaciones): barra rayada a todo lo ancho
  if (logistic) {
    return (
      <div
        className={cn(
          "absolute z-0 flex items-center justify-center gap-3 rounded-lg border border-dashed px-4 text-sm",
          paint === "past" ? "opacity-55" : "",
          clickable && "cursor-pointer hover:border-mar-300",
        )}
        style={{
          ...style,
          borderColor: rgba(meta.color, 0.35),
          backgroundColor: "#F7FAFB",
          backgroundImage: `repeating-linear-gradient(135deg, ${rgba(meta.color, 0.07)} 0 7px, transparent 7px 14px)`,
        }}
        role={clickable ? "button" : "row"}
        tabIndex={clickable ? 0 : undefined}
        aria-label={a11y}
        onClick={clickable ? onOpen : undefined}
        onKeyDown={clickable ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen()) : undefined}
      >
        <span className="text-xs tabular-nums text-tinta-tenue">
          {s.start}–{s.end}
        </span>
        <span className="font-medium text-tinta-suave">{title}</span>
        {paint === "live" && <LiveBadge t={t} />}
      </div>
    );
  }

  const venueWide = placed.kind === "venue";
  const global = placed.kind === "global";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={a11y}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      className={cn(
        "group absolute flex cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition",
        "hover:-translate-y-px hover:shadow-tarjeta focus-visible:z-[28]",
        venueWide || global ? "z-10" : "z-20",
        paint === "live" && "z-[25] ring-2 ring-oro-400 shadow-brillo",
        paint === "past" && "opacity-55 hover:opacity-100",
        s.cancelled && "opacity-60",
      )}
      style={{
        ...style,
        borderColor: rgba(meta.color, 0.28),
        backgroundColor: venueWide ? rgba(meta.color, 0.06) : "#fff",
        backgroundImage: venueWide
          ? `repeating-linear-gradient(90deg, transparent 0, transparent calc(100% / ${roomColumns} - 1px), ${rgba(meta.color, 0.22)} calc(100% / ${roomColumns} - 1px), ${rgba(meta.color, 0.22)} calc(100% / ${roomColumns}))`
          : `linear-gradient(90deg, ${rgba(meta.color, 0.09)}, ${rgba(meta.color, 0.02)} 60%)`,
      }}
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: meta.color }} aria-hidden />
      <div className={cn("flex min-h-0 flex-1 flex-col pl-3.5 pr-1.5", compact ? "justify-center py-1" : "py-2")}>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.72rem] font-medium tabular-nums text-tinta-suave">
              <span>
                {s.start}–{s.end}
              </span>
              {paint === "live" && <LiveBadge t={t} />}
              {s.cancelled && <span className="rounded-sm bg-red-50 px-1.5 text-[0.65rem] font-semibold uppercase text-red-700">{t.cancelled}</span>}
              {s.streamUrl && <Radio className="h-3 w-3 text-mar-600" aria-label={t.stream} />}
            </p>
            <p
              className={cn(
                "font-display font-semibold leading-snug text-tinta",
                compact ? "truncate text-[0.85rem]" : heightPx >= 150 ? "mt-0.5 line-clamp-3 text-[0.95rem]" : "mt-0.5 line-clamp-2 text-[0.95rem]",
                s.cancelled && "line-through",
              )}
            >
              {title}
            </p>
          </div>
          <StarButton active={starred} onToggle={onToggleAgenda} label={starred ? t.removeFromAgenda : t.addToAgenda} className="-mr-0.5 -mt-0.5" />
        </div>
        {!compact && (
          <div className="mt-auto space-y-0.5 pt-1">
            {subtitle && <p className="line-clamp-1 text-xs text-tinta-suave">{subtitle}</p>}
            <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-wide" style={{ color: meta.color }}>
              {meta.label[locale]}
              {s.talks.length > 0 && <span className="font-normal normal-case tracking-normal text-tinta-tenue">{t.talks(s.talks.length)}</span>}
              {venueWide && <span className="font-normal normal-case tracking-normal text-tinta-tenue">{t.simultaneous}</span>}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function LiveBadge({ t }: { t: ProgrammeStrings }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-oro-400 px-1.5 py-px text-[0.62rem] font-bold uppercase tracking-wide text-noche-900">
      <span className="h-1.5 w-1.5 animate-latido rounded-full bg-noche-900" aria-hidden />
      {t.live}
    </span>
  );
}
