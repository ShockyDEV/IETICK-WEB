import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, MapPin, Presentation, Send } from "lucide-react";
import { EjeIcon } from "@/components/ui/eje-icon";
import { PageArt } from "@/components/ui/page-art";
import { PageHeader } from "@/components/ui/page-header";
import { PendingNote } from "@/components/ui/pending-note";
import { SectionHeading } from "@/components/ui/section-heading";
import { EJES } from "@/content/ejes";
import { FECHAS, formatFecha } from "@/content/fechas";
import { SITE } from "@/content/site";
import { UI } from "@/content/ui";
import { href, isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { dayLabel, getProgramme, tr, type ProgrammeData } from "@/lib/programme";
import { sessionLocation } from "@/lib/programme-format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    eyebrow: "Comunicaciones",
    title: "Comparte tu investigación y tu experiencia",
    lead: "ieTIC 2027 abrirá una convocatoria de comunicaciones sobre innovación educativa con tecnologías, organizada en seis ejes temáticos.",
    modesEyebrow: "Modalidades",
    modesTitle: "Dónde se presentan los trabajos",
    modesLead: "Según el programa provisional, las comunicaciones se defenderán en paneles simultáneos en las aulas del IUCE y habrá una sesión específica para presentar proyectos de investigación.",
    ejesEyebrow: "Ejes temáticos",
    ejesTitle: "Elige el eje de tu comunicación",
    seeLines: "Ver las líneas de cada eje",
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
    modesLead: "De acordo com o programa provisório, as comunicações serão apresentadas em painéis simultâneos nas salas do IUCE e haverá uma sessão específica para a apresentação de projetos de investigação.",
    ejesEyebrow: "Eixos temáticos",
    ejesTitle: "Escolhe o eixo da tua comunicação",
    seeLines: "Ver as linhas de cada eixo",
    rulesEyebrow: "Submissão",
    rulesTitle: "Normas, modelos e prazos",
    rulesPending: "Chamada em preparação",
    rulesText: "Aqui serão publicadas as normas de apresentação, os modelos (em espanhol e português), a plataforma de submissão e o calendário da chamada.",
    datesTitle: "Datas importantes",
    sessions: (n: number) => (n === 1 ? "1 sessão" : `${n} sessões`),
  },
} as const;

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
  const modes = data ? data.sessions.filter((s) => s.type === "COMUNICACIONES" || s.type === "PROYECTOS") : [];

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead} art={<PageArt />} />

      {/* Modalidades (del programa) */}
      <section className="py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading index="01" eyebrow={t.modesEyebrow} title={t.modesTitle} lead={t.modesLead} />
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {modes.map((s) => {
              const day = data!.days.find((d) => d.key === s.day);
              const loc = sessionLocation(s, data!, locale);
              const Icon = s.type === "PROYECTOS" ? Presentation : FileText;
              return (
                <li key={s.id} className="tarjeta p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mar-50 text-mar-600">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold">{tr(s.title, s.titlePt, locale)}</h3>
                  <p className="mt-3 flex items-center gap-2 text-sm text-tinta-suave">
                    <CalendarDays className="h-4 w-4 text-mar-600" aria-hidden />
                    {day ? dayLabel(day, locale) : s.day} · <span className="font-mono">{s.start}–{s.end}</span>
                  </p>
                  {loc && (
                    <p className="mt-1.5 flex items-center gap-2 text-sm text-tinta-suave">
                      <MapPin className="h-4 w-4 text-mar-600" aria-hidden /> {loc.label}
                    </p>
                  )}
                  {s.subtitle && <p className="mt-3 text-sm text-tinta-tenue">{tr(s.subtitle, s.subtitlePt, locale)}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Ejes */}
      <section className="border-y border-linea bg-papel py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading index="02" eyebrow={t.ejesEyebrow} title={t.ejesTitle} />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EJES.map((eje) => (
              <li key={eje.id}>
                <Link
                  href={`${href(locale, "/congreso")}#eje-${eje.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-linea bg-white p-4 transition hover:border-mar-300 hover:shadow-tarjeta"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-noche-900 text-cian-300">
                    <EjeIcon icon={eje.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-display font-semibold leading-snug text-tinta group-hover:text-mar-700">{pick(eje.title, locale)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={`${href(locale, "/congreso")}#ejes`} className="enlace mt-8 inline-flex items-center gap-1">
            {t.seeLines} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Normas y fechas */}
      <section className="py-20 sm:py-24">
        <div className="contenedor grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading index="03" eyebrow={t.rulesEyebrow} title={t.rulesTitle} />
            <PendingNote title={t.rulesPending} className="mt-8">
              {t.rulesText}
            </PendingNote>
            <p className="mt-8 flex items-center gap-2 text-sm text-tinta-suave">
              <Send className="h-4 w-4 text-mar-600" aria-hidden />
              {pick(SITE.venue.name, locale)} · <a className="enlace" href={`mailto:${SITE.venue.email}`}>{SITE.venue.email}</a>
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-noche-900 p-7 text-white">
              <h2 className="font-display text-xl font-bold text-white">{t.datesTitle}</h2>
              <ol className="mt-5 space-y-4">
                {FECHAS.filter((f) => !f.highlight).map((f, i) => {
                  const value = formatFecha(f, locale);
                  return (
                    <li key={f.id} className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                      <span className="flex gap-3 text-sm text-white/80">
                        <span className="font-mono text-xs text-cian-300">{String(i + 1).padStart(2, "0")}</span>
                        {pick(f.label, locale)}
                      </span>
                      {value ? (
                        <span className="shrink-0 text-right text-sm font-medium text-oro-300">{value}</span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-oro-400/50 px-2.5 py-0.5 text-xs text-oro-200">{pick(UI.pending, locale)}</span>
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
