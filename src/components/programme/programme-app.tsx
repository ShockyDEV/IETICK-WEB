"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FlaskConical, Globe2, Star } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { ProgrammeData } from "@/lib/programme";
import { shortDay, dayMonth } from "@/lib/programme-format";
import { SESSION_TYPES, SESSION_TYPE_META } from "@/lib/session-types";
import { CONGRESS_TZ, formatOffset, offsetVsMadrid, zonedParts } from "@/lib/time";
import { cn } from "@/lib/cn";
import { AgendaDrawer } from "./agenda-drawer";
import { PT_ES } from "./i18n";
import { ProgrammeGrid } from "./programme-grid";
import { ProgrammeList } from "./programme-list";
import { SessionDialog } from "./session-dialog";
import { SessionSearch } from "./session-search";
import { copyText, parseSimulatedNow, useAgenda } from "./utils";

/**
 * Programa interactivo (versión Next.js del programa en vivo de ICED26):
 * pestañas por día, parrilla por salas (escritorio) o lista (móvil),
 * marcador «en directo» con hora de Madrid, agenda personal en el navegador,
 * buscador, enlaces directos a cada sesión (?sesion=…) y conversión a la
 * hora local del visitante. Con ?ahora=AAAA-MM-DDTHH:MM se simula la hora
 * para revisar el modo en directo antes del congreso.
 */
export function ProgrammeApp({ data, locale }: { data: ProgrammeData; locale: Locale }) {
  const t = PT_ES[locale];
  const [dayKey, setDayKey] = useState(data.days[0]?.key ?? "");
  const [now, setNow] = useState<Date | null>(null);
  const [simulated, setSimulated] = useState<Date | null>(null);
  const [timeZone, setTimeZone] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [agenda, toggleAgenda] = useAgenda();
  const mounted = useRef(false);

  // Arranque en cliente: parámetros de la URL, zona horaria y día de hoy
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sim = parseSimulatedNow(params.get("ahora"));
    const current = sim ?? new Date();
    setSimulated(sim);
    setNow(current);
    try {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || null);
    } catch {
      /* sin Intl: no se ofrece conversión */
    }
    const target = data.sessions.find((s) => s.id === params.get("sesion"));
    const today = zonedParts(current).dayKey;
    if (target) {
      setDayKey(target.day);
      setOpenId(target.id);
    } else if (data.days.some((d) => d.key === today)) {
      setDayKey(today);
    }
    mounted.current = true;
  }, [data]);

  // Reloj: refresco cada 30 s (la hora simulada queda congelada)
  useEffect(() => {
    if (simulated) return;
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, [simulated]);

  // La URL refleja la sesión abierta (se puede copiar de la barra)
  useEffect(() => {
    if (!mounted.current) return;
    const url = new URL(window.location.href);
    if (openId) url.searchParams.set("sesion", openId);
    else url.searchParams.delete("sesion");
    window.history.replaceState(window.history.state, "", url.toString());
  }, [openId]);

  const lastDay = data.days[data.days.length - 1]?.key;
  const todayKey = now ? zonedParts(now).dayKey : null;
  const archive = !!(todayKey && lastDay && todayKey > lastDay);
  const openSession = useMemo(() => data.sessions.find((s) => s.id === openId) ?? null, [data, openId]);

  const open = useCallback(
    (id: string) => {
      const s = data.sessions.find((x) => x.id === id);
      if (!s) return;
      setDayKey(s.day);
      setAgendaOpen(false);
      setOpenId(id);
    },
    [data],
  );

  const onToggleAgenda = useCallback(
    (id: string) => {
      const added = toggleAgenda(id);
      toast.success(added ? t.added : t.removed, { id: "agenda" });
    },
    [toggleAgenda, t],
  );

  const copyLink = async () => {
    if (!openId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("sesion", openId);
    url.searchParams.delete("ahora");
    if (await copyText(url.toString())) toast.success(t.linkCopied, { id: "link" });
  };

  const typesPresent = SESSION_TYPES.filter((k) => data.sessions.some((s) => s.type === k));
  const tzOffset = timeZone && data.days[0] ? offsetVsMadrid(data.days[0].key, "12:00", timeZone) : 0;

  return (
    <div style={{ ["--toolbar-h" as string]: "4.75rem" }}>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { background: "#06222F", color: "#fff", borderRadius: "999px", fontSize: "0.9rem" },
          iconTheme: { primary: "#EBAE3F", secondary: "#06222F" },
        }}
      />

      {simulated && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-oro-300 bg-oro-50 px-4 py-3 text-sm text-oro-800">
          <p className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" aria-hidden />
            <strong>{t.simulated}:</strong> {shortDay(zonedParts(simulated).dayKey, locale)} · {zonedParts(simulated).label} ({t.madridTime})
          </p>
          <a href="?" className="font-semibold underline underline-offset-4">
            {t.backToReal}
          </a>
        </div>
      )}

      {/* Barra de herramientas fija bajo la cabecera */}
      <div className="sticky top-[var(--header-h)] z-40 -mx-4 mb-5 border-b border-linea bg-papel/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:h-[var(--toolbar-h)] lg:border-0 lg:px-0 lg:py-0">
        <div className="flex h-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div role="tablist" aria-label={t.days} className="flex flex-1 gap-1 rounded-full border border-linea bg-white p-1 shadow-tarjeta lg:flex-none">
              {data.days.map((d) => {
                const selected = d.key === dayKey;
                const isToday = d.key === todayKey;
                return (
                  <button
                    key={d.key}
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setDayKey(d.key)}
                    className={cn(
                      "relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition lg:flex-none lg:px-5",
                      selected ? "bg-noche-900 text-white" : "text-tinta-suave hover:bg-papel hover:text-tinta",
                    )}
                  >
                    <span>{shortDay(d.key, locale)}</span>
                    <span className={cn("font-mono text-xs font-normal", selected ? "text-cian-300" : "text-tinta-tenue")}>
                      {dayMonth(d.key, locale).replace(/^\d+\s*/, "")}
                    </span>
                    {isToday && (
                      <span className="absolute -right-0.5 -top-0.5 rounded-full bg-oro-400 px-1.5 text-[0.6rem] font-bold uppercase text-noche-900">
                        {t.today}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setAgendaOpen(true)}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-linea bg-white px-4 text-sm font-semibold text-tinta shadow-tarjeta transition hover:border-oro-400 lg:hidden"
            >
              <Star className="h-4 w-4 text-oro-500" fill={agenda.size ? "currentColor" : "none"} aria-hidden />
              <span className="sr-only">{t.agenda}</span>
              <span className="font-mono">{agenda.size}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <SessionSearch data={data} locale={locale} t={t} onSelect={open} className="flex-1 lg:w-80 lg:flex-none" />
            <button
              type="button"
              onClick={() => setAgendaOpen(true)}
              className="hidden h-11 shrink-0 items-center gap-2 rounded-full border border-linea bg-white px-4 text-sm font-semibold text-tinta shadow-tarjeta transition hover:border-oro-400 lg:inline-flex"
            >
              <Star className="h-4 w-4 text-oro-500" fill={agenda.size ? "currentColor" : "none"} aria-hidden />
              {t.agenda}
              <span className="rounded-full bg-papel px-2 font-mono text-xs">{agenda.size}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda + aviso de zona horaria */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label={t.legend}>
          {typesPresent.map((k) => (
            <li key={k} className="flex items-center gap-1.5 text-xs text-tinta-suave">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SESSION_TYPE_META[k].color }} aria-hidden />
              {SESSION_TYPE_META[k].label[locale]}
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-1.5 text-xs text-tinta-tenue">
          <Globe2 className="h-3.5 w-3.5" aria-hidden />
          {locale === "pt" ? "Horas em hora de Madrid" : "Horas en hora de Madrid"} ({CONGRESS_TZ})
          {timeZone && tzOffset !== 0 && (
            <span>
              {" · "}
              {locale === "pt" ? "o teu dispositivo" : "tu dispositivo"}: {formatOffset(tzOffset)}
            </span>
          )}
        </p>
      </div>

      <div className="hidden lg:block">
        <ProgrammeGrid
          data={data}
          dayKey={dayKey}
          locale={locale}
          t={t}
          now={now}
          archive={archive}
          agenda={agenda}
          onToggleAgenda={onToggleAgenda}
          onOpen={open}
        />
      </div>
      <div className="lg:hidden">
        <ProgrammeList
          data={data}
          dayKey={dayKey}
          locale={locale}
          t={t}
          now={now}
          archive={archive}
          agenda={agenda}
          onToggleAgenda={onToggleAgenda}
          onOpen={open}
        />
      </div>

      <SessionDialog
        session={openSession}
        data={data}
        locale={locale}
        t={t}
        now={now}
        timeZone={timeZone}
        starred={!!openId && agenda.has(openId)}
        onToggleAgenda={() => openId && onToggleAgenda(openId)}
        onCopyLink={copyLink}
        onClose={() => setOpenId(null)}
      />
      <AgendaDrawer
        open={agendaOpen}
        data={data}
        locale={locale}
        t={t}
        now={now}
        agenda={agenda}
        onToggleAgenda={onToggleAgenda}
        onOpenSession={open}
        onClose={() => setAgendaOpen(false)}
      />
    </div>
  );
}
