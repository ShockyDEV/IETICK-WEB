import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import { FacetPattern } from "@/components/art/FacetPattern";
import { Countdown } from "@/components/home/countdown";
import { ProgrammeGlance } from "@/components/home/programme-glance";
import { HomeHeroArt } from "@/components/home/hero-art-slot";
import { EjeIcon } from "@/components/ui/eje-icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { EJES } from "@/content/ejes";
import { FECHAS, formatFecha } from "@/content/fechas";
import { SITE, siteUrl } from "@/content/site";
import { UI } from "@/content/ui";
import { href, isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getProgramme, type ProgrammeData } from "@/lib/programme";
import { madridDate } from "@/lib/time";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return pageMetadata(locale, "/", null);
}

const T = {
  es: {
    eyebrow: "XIII Conferencia Ibérica · Salamanca",
    ctaEjes: "Ejes temáticos",
    datesLabel: "Fechas",
    venueLabel: "Sede",
    welcomeEyebrow: "El congreso",
    welcomeTitle: "Innovar con TIC, en abierto",
    welcome: [
      "Desde hace más de una década, la Conferencia Ibérica de Innovación en Educación con TIC reúne a docentes, investigadores y profesionales de la educación de España y Portugal para compartir investigaciones, experiencias y propuestas sobre el uso educativo de las tecnologías.",
      "En su XIII edición, ieTIC llega al Instituto Universitario de Ciencias de la Educación de la Universidad de Salamanca con una pregunta de fondo: cómo pueden las tecnologías mejorar el aprendizaje dentro del ecosistema de la Ciencia Abierta, con los Recursos Educativos Abiertos y el Diseño Universal para el Aprendizaje como hilo conductor.",
    ],
    welcomeMore: "Conoce el congreso",
    facts: [
      { value: "XIII", label: "edición de la conferencia ibérica" },
      { value: "2", label: "jornadas de ponencias, talleres y comunicaciones" },
      { value: "6", label: "ejes temáticos para enviar tu comunicación" },
    ],
    ejesEyebrow: "Ejes temáticos",
    ejesTitle: "Seis ejes para pensar la educación con tecnología",
    ejesLead: "Las comunicaciones se organizan en torno a seis grandes ejes, del diseño de recursos abiertos al uso educativo de la inteligencia artificial.",
    lines: (n: number) => `${n} líneas`,
    progEyebrow: "Programa",
    progTitle: "Dos jornadas en Salamanca",
    progLead: "Ponencias invitadas, panel de expertos, mesa redonda, talleres simultáneos y paneles de comunicaciones. Consulta la versión interactiva para ver cada sesión por sala y hora.",
    progCta: "Abrir el programa interactivo",
    venueEyebrow: "Sede",
    venueTitle: "El IUCE, en el Edificio Solís",
    venueText:
      "ieTIC 2027 se celebra en el Instituto Universitario de Ciencias de la Educación (IUCE) de la Universidad de Salamanca, en el Edificio Solís del Campus de Educación, a pocos minutos a pie del centro histórico de la ciudad.",
    venueCta: "Espacios y cómo llegar",
    capacity: (n: number) => `${n} personas`,
    datesEyebrow: "Fechas clave",
    datesTitle: "Calendario",
    participate: "¿Quieres presentar tu trabajo?",
    participateText: "Consulta los ejes temáticos y las modalidades de participación. Las normas, plantillas y plazos se publicarán en la página de comunicaciones.",
  },
  pt: {
    eyebrow: "XIII Conferência Ibérica · Salamanca",
    ctaEjes: "Eixos temáticos",
    datesLabel: "Datas",
    venueLabel: "Local",
    welcomeEyebrow: "O congresso",
    welcomeTitle: "Inovar com TIC, em aberto",
    welcome: [
      "Há mais de uma década que a Conferência Ibérica de Inovação na Educação com TIC reúne docentes, investigadores e profissionais da educação de Espanha e Portugal para partilhar investigações, experiências e propostas sobre o uso educativo das tecnologias.",
      "Na sua XIII edição, o ieTIC chega ao Instituto Universitário de Ciências da Educação da Universidade de Salamanca com uma pergunta de fundo: como podem as tecnologias melhorar a aprendizagem no ecossistema da Ciência Aberta, tendo os Recursos Educativos Abertos e o Desenho Universal para a Aprendizagem como fio condutor.",
    ],
    welcomeMore: "Conhece o congresso",
    facts: [
      { value: "XIII", label: "edição da conferência ibérica" },
      { value: "2", label: "dias de conferências, oficinas e comunicações" },
      { value: "6", label: "eixos temáticos para submeter a tua comunicação" },
    ],
    ejesEyebrow: "Eixos temáticos",
    ejesTitle: "Seis eixos para pensar a educação com tecnologia",
    ejesLead: "As comunicações organizam-se em torno de seis grandes eixos, do design de recursos abertos ao uso educativo da inteligência artificial.",
    lines: (n: number) => `${n} linhas`,
    progEyebrow: "Programa",
    progTitle: "Dois dias em Salamanca",
    progLead: "Conferências convidadas, painel de especialistas, mesa-redonda, oficinas simultâneas e painéis de comunicações. Consulta a versão interativa para ver cada sessão por sala e hora.",
    progCta: "Abrir o programa interativo",
    venueEyebrow: "Local",
    venueTitle: "O IUCE, no Edifício Solís",
    venueText:
      "O ieTIC 2027 realiza-se no Instituto Universitário de Ciências da Educação (IUCE) da Universidade de Salamanca, no Edifício Solís do Campus de Educação, a poucos minutos a pé do centro histórico da cidade.",
    venueCta: "Espaços e como chegar",
    capacity: (n: number) => `${n} pessoas`,
    datesEyebrow: "Datas importantes",
    datesTitle: "Calendário",
    participate: "Queres apresentar o teu trabalho?",
    participateText: "Consulta os eixos temáticos e as modalidades de participação. As normas, os modelos e os prazos serão publicados na página de comunicações.",
  },
} as const;

async function loadProgramme(): Promise<ProgrammeData | null> {
  try {
    return await getProgramme();
  } catch (e) {
    console.error("[home] no se pudo leer el programa:", e);
    return null;
  }
}

export default async function HomePage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const t = T[locale];
  const programme = await loadProgramme();
  const iuceRooms = programme?.rooms.filter((r) => r.venueId === "iuce") ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: `ieTIC 2027 — ${pick(SITE.fullName, locale)}`,
    description: `${pick(SITE.lema, locale)}. ${pick(SITE.sublema, locale)}.`,
    startDate: madridDate(SITE.startsAt.day, SITE.startsAt.time).toISOString(),
    endDate: madridDate(SITE.endsAt.day, SITE.endsAt.time).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: ["es", "pt"],
    url: `${siteUrl()}${href(locale, "/")}`,
    image: [`${siteUrl()}/og-image.png`],
    location: {
      "@type": "Place",
      name: pick(SITE.venue.name, locale),
      address: {
        "@type": "PostalAddress",
        streetAddress: "Paseo de Canalejas, 169",
        postalCode: "37008",
        addressLocality: "Salamanca",
        addressCountry: "ES",
      },
    },
    organizer: { "@type": "CollegeOrUniversity", name: "Universidad de Salamanca", url: "https://www.usal.es" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-noche-900 text-white">
        <HomeHeroArt />
        <div className="contenedor relative z-10 flex min-h-[calc(100svh-var(--header-h))] flex-col justify-start pb-[42vh] pt-12 sm:pt-16 lg:justify-center lg:pb-24 lg:pt-10">
          <div className="max-w-xl animate-aparecer lg:max-w-[40rem]">
            <p className="antetitulo-claro">{t.eyebrow}</p>
            <h1 className="sr-only">
              ieTIC 2027 — {pick(SITE.fullName, locale)}
            </h1>
            <Image
              src="/brand/ietic27-logo-oscuro.png"
              alt=""
              width={718}
              height={348}
              priority
              className="mt-6 w-[min(26rem,78vw)] drop-shadow-[0_8px_30px_rgba(3,24,34,0.6)]"
            />
            <p className="mt-8 font-display text-2xl font-semibold leading-snug text-white sm:text-[1.75rem]">
              {pick(SITE.lema, locale)}
            </p>
            <p className="mt-3 text-lg leading-relaxed text-cian-200/90">{pick(SITE.sublema, locale)}</p>

            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[0.95rem]">
              <div className="flex items-center gap-2.5">
                <dt className="sr-only">{t.datesLabel}</dt>
                <CalendarDays className="h-5 w-5 text-oro-300" aria-hidden />
                <dd className="font-medium">{pick(SITE.datesLabel, locale)}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <dt className="sr-only">{t.venueLabel}</dt>
                <MapPin className="h-5 w-5 text-oro-300" aria-hidden />
                <dd className="font-medium">{pick(SITE.venue.short, locale)}</dd>
              </div>
            </dl>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={href(locale, "/programa")} className="boton-oro">
                {pick(UI.seeProgramme, locale)}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href={href(locale, "/congreso#ejes")} className="boton-contorno-claro">
                {t.ctaEjes}
              </Link>
            </div>

            <div className="mt-10">
              <Countdown locale={locale} start={SITE.startsAt} end={SITE.endsAt} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bienvenida ───────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28" aria-labelledby="bienvenida">
        <div className="contenedor grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading index="01" eyebrow={t.welcomeEyebrow} title={t.welcomeTitle} id="bienvenida" />
            <div className="prosa mt-6">
              {t.welcome.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <Link href={href(locale, "/congreso")} className="enlace mt-8 inline-flex items-center gap-1">
              {t.welcomeMore} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid content-start gap-4 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
            {t.facts.map((f) => (
              <li key={f.label} className="tarjeta flex items-center gap-5 p-5">
                <span className="min-w-[4.5rem] font-display text-4xl font-extrabold text-mar-600">{f.value}</span>
                <span className="text-sm leading-snug text-tinta-suave">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Ejes temáticos ───────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-noche-900 py-20 text-white sm:py-28" aria-labelledby="ejes-home">
        <FacetPattern className="-z-10" seed={11} />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_90%_0%,rgba(22,116,146,0.5),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(235,174,63,0.10),transparent_50%)]"
          aria-hidden
        />
        <div className="contenedor">
          <SectionHeading index="02" eyebrow={t.ejesEyebrow} title={t.ejesTitle} lead={t.ejesLead} dark id="ejes-home" />
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EJES.map((eje, i) => (
              <li key={eje.id}>
                <Link
                  href={`${href(locale, "/congreso")}#eje-${eje.id}`}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cian-300/40 hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cian-300/10 text-cian-300 ring-1 ring-cian-300/20 transition group-hover:bg-cian-300 group-hover:text-noche-900">
                      <EjeIcon icon={eje.icon} className="h-6 w-6" />
                    </span>
                    <span className="font-mono text-xs text-white/40">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-white">{pick(eje.title, locale)}</h3>
                  <ul className="mt-3 space-y-1.5 text-sm leading-snug text-white/65">
                    {pick(eje.lines, locale).map((line) => (
                      <li key={line} className="flex gap-2">
                        <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-oro-400" aria-hidden />
                        {line.replace(/\.$/, "")}
                      </li>
                    ))}
                  </ul>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Programa en un vistazo ───────────────────────────────────── */}
      <section className="bg-papel py-20 sm:py-28" aria-labelledby="programa-home">
        <div className="contenedor">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading index="03" eyebrow={t.progEyebrow} title={t.progTitle} lead={t.progLead} id="programa-home" />
            <Link href={href(locale, "/programa")} className="boton-mar shrink-0 self-start lg:self-auto">
              {t.progCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          {programme && <ProgrammeGlance data={programme} locale={locale} />}
        </div>
      </section>

      {/* ─── Sede ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28" aria-labelledby="sede-home">
        <div className="contenedor grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-elevada">
              <Image
                src="/espacios/edificio-solis-claustro.webp"
                alt={locale === "pt" ? "Claustro do Edifício Solís, sede do IUCE" : "Claustro del Edificio Solís, sede del IUCE"}
                width={1000}
                height={750}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 hidden rounded-2xl bg-noche-900 px-5 py-4 text-white shadow-elevada sm:block">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-cian-300">Salamanca</p>
              <p className="mt-1 font-display text-lg font-semibold">{pick(SITE.venue.building, locale)}</p>
            </div>
          </div>
          <div>
            <SectionHeading index="04" eyebrow={t.venueEyebrow} title={t.venueTitle} id="sede-home" />
            <p className="prosa mt-6">{t.venueText}</p>
            {iuceRooms.length > 0 && (
              <ul className="mt-8 grid grid-cols-2 gap-3">
                {iuceRooms.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 rounded-xl border border-linea p-3">
                    {r.imageUrl && (
                      <Image src={r.imageUrl} alt="" width={96} height={72} className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-semibold">{locale === "pt" && r.namePt ? r.namePt : r.name}</p>
                      {r.capacity && (
                        <p className="flex items-center gap-1 text-xs text-tinta-tenue">
                          <Users className="h-3.5 w-3.5" aria-hidden /> {t.capacity(r.capacity)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link href={href(locale, "/sede")} className="boton-contorno mt-8">
              {t.venueCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Fechas clave ─────────────────────────────────────────────── */}
      <section className="border-t border-linea bg-papel py-20 sm:py-24" aria-labelledby="fechas-home">
        <div className="contenedor">
          <SectionHeading index="05" eyebrow={t.datesEyebrow} title={t.datesTitle} id="fechas-home" />
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {FECHAS.map((d, i) => {
              const hl = !!d.highlight;
              const value = formatFecha(d, locale);
              return (
                <li
                  key={d.id}
                  className={
                    hl
                      ? "relative rounded-2xl bg-noche-900 p-6 text-white shadow-elevada"
                      : "relative rounded-2xl border border-linea bg-white p-6"
                  }
                >
                  <span className={hl ? "font-mono text-xs text-cian-300" : "font-mono text-xs text-mar-600"}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className={hl ? "mt-3 font-display font-semibold text-white" : "mt-3 font-display font-semibold"}>{pick(d.label, locale)}</p>
                  <p
                    className={
                      hl
                        ? "mt-2 font-medium text-oro-300"
                        : value
                          ? "mt-2 font-medium text-mar-700"
                          : "mt-2 inline-flex rounded-full bg-mar-50 px-2.5 py-0.5 text-sm text-mar-700"
                    }
                  >
                    {value ?? pick(UI.pending, locale)}
                  </p>
                </li>
              );
            })}
          </ol>
          <div className="mt-12 flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-mar-600 to-mar-800 p-8 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-display text-2xl font-bold">{t.participate}</p>
              <p className="mt-2 text-white/80">{t.participateText}</p>
            </div>
            <Link href={href(locale, "/comunicaciones")} className="boton-oro shrink-0 self-start lg:self-auto">
              {pick(UI.submit, locale)}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
