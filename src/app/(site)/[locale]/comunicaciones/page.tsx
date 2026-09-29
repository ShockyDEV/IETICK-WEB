import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileText, MapPin, Presentation, Send } from "lucide-react";
import { EjeIcon } from "@/components/ui/eje-icon";
import { PageArt } from "@/components/ui/page-art";
import { PageHeader } from "@/components/ui/page-header";
import { PendingNote } from "@/components/ui/pending-note";
import { SectionHeading } from "@/components/ui/section-heading";
import { EJES } from "@/content/ejes";
import { FECHAS, formatFecha } from "@/content/fechas";
import { SITE } from "@/content/site";
import { sectionColor, UI } from "@/content/ui";
import { href, isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getProgramme, type ProgrammeData } from "@/lib/programme";
import { monthShort, sessionLocation, shortDay } from "@/lib/programme-format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    eyebrow: "Comunicaciones",
    title: "Comparte tu investigación y tu experiencia",
    lead: "ieTIC 2027 abrirá una convocatoria de comunicaciones sobre innovación educativa con tecnologías, organizada en seis ejes temáticos.",
    modesEyebrow: "Modalidades",
    modesTitle: "Dónde se presentan los trabajos",
    modesLead: "Dos formas de presentar tu trabajo en el congreso, según el programa provisional.",
    modes: {
      COMUNICACIONES: {
        title: "Comunicaciones",
        text: "Las comunicaciones aceptadas se presentan en mesas simultáneas repartidas por las aulas del IUCE.",
      },
      PROYECTOS: {
        title: "Proyectos de investigación",
        text: "Una sesión propia, en el salón de actos, para dar a conocer proyectos de investigación ante todo el congreso.",
      },
    },
    inProgramme: "Ver en el programa",
    ejesEyebrow: "Ejes temáticos",
    ejesTitle: "Los temas de la convocatoria",
    ejesLead: "Las comunicaciones se organizan en seis ejes, cada uno con sus líneas de trabajo.",
    rulesEyebrow: "Envío",
    rulesTitle: "Normas, plantillas y plazos",
    rulesPending: "Convocatoria en preparación",
    rulesText: "Aquí se publicarán las normas de presentación, las plantillas (en español y portugués), la plataforma de envío y el calendario de la convocatoria.",
    datesTitle: "Fechas importantes",
    sessions: (n: number) => (n === 1 ? "1 sesión" : `${n} sesiones`),
  },
  pt: {
    eyebrow: "Comunicações",
    title: "Partilha a tua investigação e a tua experiência",
    lead: "O ieTIC 2027 abrirá uma chamada de comunicações sobre inovação educativa com tecnologias, organizada em seis eixos temáticos.",
    modesEyebrow: "Modalidades",
    modesTitle: "Onde se apresentam os trabalhos",
    modesLead: "Duas formas de apresentar o teu trabalho no congresso, de acordo com o programa provisório.",
    modes: {
      COMUNICACIONES: {
        title: "Comunicações",
        text: "As comunicações aceites são apresentadas em mesas simultâneas distribuídas pelas salas do IUCE.",
      },
      PROYECTOS: {
        title: "Projetos de investigação",
        text: "Uma sessão própria, no auditório, para dar a conhecer projetos de investigação a todo o congresso.",
      },
    },
    inProgramme: "Ver no programa",
    ejesEyebrow: "Eixos temáticos",
    ejesTitle: "Os temas da chamada",
    ejesLead: "As comunicações organizam-se em seis eixos, cada um com as suas linhas de trabalho.",
    rulesEyebrow: "Submissão",
    rulesTitle: "Normas, modelos e prazos",
    rulesPending: "Chamada em preparação",
    rulesText: "Aqui serão publicadas as normas de apresentação, os modelos (em espanhol e português), a plataforma de submissão e o calendário da chamada.",
    datesTitle: "Datas importantes",
    sessions: (n: number) => (n === 1 ? "1 sessão" : `${n} sessões`),
  },
} as const;

const MODE_TYPES = ["COMUNICACIONES", "PROYECTOS"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return pageMetadata(locale, "/comunicaciones", T[locale].eyebrow, T[locale].lead);
}

export default async function ComunicacionesPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const t = T[locale];

  let data: ProgrammeData | null = null;
  try {
    data = await getProgramme();
  } catch (e) {
    console.error("[comunicaciones] programa no disponible:", e);
  }
  // Una tarjeta por modalidad con todas sus franjas (no una por sesión)
  const modes = data
    ? MODE_TYPES.map((type) => ({ type, sessions: data!.sessions.filter((s) => s.type === type) })).filter(
        (m) => m.sessions.length > 0,
      )
    : [];

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead} art={<PageArt />} color={sectionColor("/comunicaciones")} />

      {/* Modalidades (del programa) */}
      <section className="py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading eyebrow={t.modesEyebrow} title={t.modesTitle} lead={t.modesLead} />
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {modes.map(({ type, sessions }, mi) => {
              const mode = t.modes[type];
              const Icon = type === "PROYECTOS" ? Presentation : FileText;
              return (
                <li key={type} data-reveal style={{ ["--d" as string]: `${mi * 110}ms` }} className="tarjeta eleva flex flex-col p-6 sm:p-7">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-mar-50 text-mar-600">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold leading-snug">{mode.title}</h3>
                      <p className="text-sm text-tinta-tenue">{t.sessions(sessions.length)}</p>
                    </div>
                  </div>
                  <p className="mt-4 leading-relaxed text-tinta-suave">{mode.text}</p>
                  <ul className="mt-6 divide-y divide-linea overflow-hidden rounded-lg border border-linea">
                    {sessions.map((s) => {
                      const loc = sessionLocation(s, data!, locale);
                      return (
                        <li key={s.id}>
                          <Link
                            href={`${href(locale, "/programa")}?sesion=${s.id}`}
                            className="group flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm transition hover:bg-papel"
                            aria-label={`${mode.title}: ${shortDay(s.day, locale)} ${monthShort(s.day, locale)}, ${s.start}–${s.end}. ${t.inProgramme}`}
                          >
                            <span className="min-w-[7.5rem] font-medium text-tinta">
                              {shortDay(s.day, locale)} {monthShort(s.day, locale)}
                            </span>
                            <span className="tabular-nums text-tinta-suave">
                              {s.start}–{s.end}
                            </span>
                            {loc && (
                              <span className="flex items-center gap-1 text-tinta-tenue">
                                <MapPin className="h-3.5 w-3.5" aria-hidden /> {loc.label}
                              </span>
                            )}
                            <ArrowUpRight className="ml-auto h-4 w-4 text-mar-600 opacity-50 transition group-hover:opacity-100" aria-hidden />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Ejes */}
      <section className="border-y border-linea bg-papel py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading eyebrow={t.ejesEyebrow} title={t.ejesTitle} lead={t.ejesLead} />
          <ul className="mt-12 grid gap-x-14 gap-y-10 md:grid-cols-2">
            {EJES.map((eje, i) => (
              <li
                key={eje.id}
                data-reveal
                style={{ ["--d" as string]: `${(i % 2) * 90 + Math.floor(i / 2) * 60}ms` }}
                className="border-t border-linea pt-6"
              >
                <h3 className="flex items-start gap-3 font-display text-lg font-bold leading-snug text-tinta">
                  <EjeIcon icon={eje.icon} className="mt-0.5 h-5 w-5 shrink-0 text-mar-600" />
                  {pick(eje.title, locale)}
                </h3>
                <ul className="mt-3 space-y-1.5 pl-8 text-[0.95rem] leading-snug text-tinta-suave">
                  {pick(eje.lines, locale).map((line) => (
                    <li key={line} className="flex gap-2.5">
                      <span className="mt-[0.7em] h-px w-2.5 shrink-0 bg-oro-500" aria-hidden />
                      {line.replace(/\.$/, "")}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Normas y fechas */}
      <section className="py-20 sm:py-24">
        <div className="contenedor grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow={t.rulesEyebrow} title={t.rulesTitle} />
            <PendingNote title={t.rulesPending} className="mt-8">
              {t.rulesText}
            </PendingNote>
            {SITE.contactEmail && (
              <p className="mt-8 flex items-center gap-2 text-sm text-tinta-suave">
                <Send className="h-4 w-4 text-mar-600" aria-hidden />
                <a className="enlace" href={`mailto:${SITE.contactEmail}`}>
                  {SITE.contactEmail}
                </a>
              </p>
            )}
          </div>
          <div className="lg:col-span-5">
            <div data-reveal="escala" className="rounded-xl bg-noche-900 p-7 text-white">
              <h2 className="font-display text-xl font-bold text-white">{t.datesTitle}</h2>
              <ol className="mt-5 space-y-4">
                {FECHAS.filter((f) => !f.highlight).map((f) => {
                  const value = formatFecha(f, locale);
                  return (
                    <li key={f.id} className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                      <span className="text-sm text-white/80">{pick(f.label, locale)}</span>
                      {value ? (
                        <span className="shrink-0 text-right text-sm font-medium text-oro-300">{value}</span>
                      ) : (
                        <span className="nota shrink-0 text-oro-200/85">{pick(UI.pending, locale)}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
