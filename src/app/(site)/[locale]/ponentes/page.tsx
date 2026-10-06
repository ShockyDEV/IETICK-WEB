import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, UserRound } from "lucide-react";
import { PageArt } from "@/components/ui/page-art";
import { PageHeader } from "@/components/ui/page-header";
import { PendingNote } from "@/components/ui/pending-note";
import { sectionColor, UI } from "@/content/ui";
import { href, isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { dayLabel, speakerList, tr, type ProgrammeData } from "@/lib/programme";
import { loadProgramme } from "@/lib/programme-data";
import { sessionLocation } from "@/lib/programme-format";
import { SESSION_TYPE_META, type SessionTypeKey } from "@/lib/session-types";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    eyebrow: "Ponentes",
    title: "Voces invitadas",
    lead: "Quién interviene en ieTIC 2027: la ponencia inaugural, el panel de expertos, los talleres, la mesa redonda sobre experiencias escolares y la presentación de proyectos de investigación.",
    inProgramme: "Ver en el programa",
    pendingTitle: "Programa de ponentes en preparación",
    pendingText: "El comité organizador está cerrando las intervenciones invitadas. Esta página se actualizará automáticamente en cuanto se publiquen en el programa.",
    error: "La información de ponentes no está disponible en este momento.",
  },
  pt: {
    eyebrow: "Oradores",
    title: "Vozes convidadas",
    lead: "Quem intervém no ieTIC 2027: a conferência inaugural, o painel de especialistas, as oficinas, a mesa-redonda sobre experiências escolares e a apresentação de projetos de investigação.",
    inProgramme: "Ver no programa",
    pendingTitle: "Programa de oradores em preparação",
    pendingText: "A comissão organizadora está a fechar as intervenções convidadas. Esta página será atualizada automaticamente assim que forem publicadas no programa.",
    error: "A informação sobre os oradores não está disponível neste momento.",
  },
} as const;

const SPEAKER_TYPES: SessionTypeKey[] = ["PONENCIA", "PANEL_EXPERTOS", "TALLER", "MESA_REDONDA", "PROYECTOS"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return pageMetadata(locale, "/ponentes", T[locale].eyebrow, T[locale].lead);
}

export default async function PonentesPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const t = T[locale];

  const data = await loadProgramme("ponentes");
  const sessions = data?.sessions.filter((s) => SPEAKER_TYPES.includes(s.type)) ?? [];
  const anyAnnounced = sessions.some((s) => speakerList(s).length > 0 || s.talks.some((t) => t.authors));

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead} art={<PageArt />} color={sectionColor("/ponentes")} />
      <section className="py-16 sm:py-20">
        <div className="contenedor">
          {!data && <p className="text-tinta-suave">{t.error}</p>}
          {data && !anyAnnounced && <PendingNote title={t.pendingTitle} className="mb-10 max-w-3xl">{t.pendingText}</PendingNote>}

          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data &&
              sessions.map((s, i) => {
                const meta = SESSION_TYPE_META[s.type];
                const people = speakerList(s);
                const day = data.days.find((d) => d.key === s.day);
                const loc = sessionLocation(s, data, locale);
                return (
                  <li key={s.id} data-reveal style={{ ["--d" as string]: `${(i % 3) * 90}ms` }} className="tarjeta eleva flex flex-col overflow-hidden">
                    <div className="relative flex h-44 items-end overflow-hidden bg-noche-900 p-5">
                      <div
                        className="absolute inset-0"
                        style={{ background: `radial-gradient(circle at 70% 20%, ${meta.color}cc, transparent 60%)` }}
                        aria-hidden
                      />
                      {people.length === 0 && s.talks.length === 0 && (
                        <span className="absolute right-5 top-5 flex h-20 w-20 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/40">
                          <UserRound className="h-10 w-10" aria-hidden />
                        </span>
                      )}
                      <p className="nota relative text-white">{(s.talks.length > 1 && s.type === "TALLER" ? meta.plural : meta.label)[locale]}</p>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="font-display text-xl font-bold leading-snug">{tr(s.title, s.titlePt, locale)}</h2>
                      {(people.length > 0 || s.talks.length > 0) && s.subtitle && (
                        <p className="nota mt-1 text-mar-700">{tr(s.subtitle, s.subtitlePt, locale)}</p>
                      )}
                      {people.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {people.map((p) => (
                            <li key={p} className="font-medium text-tinta">
                              {p}
                            </li>
                          ))}
                        </ul>
                      )}
                      {s.talks.length > 0 && (
                        <ul className="mt-4 space-y-3">
                          {s.talks.map((talk) => (
                            <li key={talk.id} className="flex gap-3">
                              <span className="mt-[0.7em] h-px w-3 shrink-0 bg-oro-500" aria-hidden />
                              <span>
                                <span className="block font-medium leading-snug text-tinta">{talk.title}</span>
                                {talk.authors && <span className="block text-sm text-tinta-suave">{talk.authors}</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {people.length === 0 && s.talks.length === 0 && (
                        <p className="nota mt-3 text-tinta-tenue">
                          {s.subtitle ? tr(s.subtitle, s.subtitlePt, locale) : pick(UI.pending, locale)}
                        </p>
                      )}
                      <div className="mt-auto space-y-1.5 pt-6 text-sm text-tinta-suave">
                        <p className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-mar-600" aria-hidden />
                          {day ? dayLabel(day, locale) : s.day}, <span className="tabular-nums">{s.start}–{s.end}</span>
                        </p>
                        {loc && (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-mar-600" aria-hidden /> {loc.label}
                          </p>
                        )}
                      </div>
                      <Link href={`${href(locale, "/programa")}?sesion=${s.id}`} className="enlace mt-5 inline-flex items-center gap-1 text-sm">
                        {t.inProgramme} <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </section>
    </>
  );
}
