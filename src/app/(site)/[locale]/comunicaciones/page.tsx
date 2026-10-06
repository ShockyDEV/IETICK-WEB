import { statSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpRight, FileText, Mail, MapPin, MonitorPlay, Presentation } from "lucide-react";
import { EjeIcon } from "@/components/ui/eje-icon";
import { PageArt } from "@/components/ui/page-art";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { EJES } from "@/content/ejes";
import { FECHAS, GRUPOS_FECHA, formatFecha } from "@/content/fechas";
import { SITE } from "@/content/site";
import { sectionColor, UI } from "@/content/ui";
import { href, isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { ProgrammeData } from "@/lib/programme";
import { loadProgramme } from "@/lib/programme-data";
import { monthShort, sessionLocation, shortDay } from "@/lib/programme-format";

type Props = { params: Promise<{ locale: string }> };

// Normas, plantillas y plazos: documento «Información para la web de ieTIC
// 2027» (01-10-2026).
const T = {
  es: {
    eyebrow: "Comunicaciones",
    title: "Comparte tu investigación y tu experiencia",
    lead: (from: string, to: string) =>
      `Envío de resúmenes del ${from} al ${to}, en español, portugués o inglés. Las comunicaciones se presentan en el congreso de forma presencial o en línea.`,
    meta: "Normas, plantillas, ejes temáticos y plazos para presentar una comunicación en ieTIC 2027.",
    ctaSubmit: "Enviar en EasyChair",
    ctaTemplates: "Descargar las plantillas",
    rulesEyebrow: "Participación",
    rulesTitle: "Normas para presentar una comunicación",
    rules: [
      "Cada autor o autora puede presentar un máximo de dos comunicaciones.",
      "Cada comunicación puede firmarla un máximo de cuatro personas.",
      "Todas las personas firmantes deben estar inscritas en el congreso.",
      "Una de ellas presenta la comunicación en el congreso, en la modalidad (presencial o en línea) en la que se haya inscrito.",
    ],
    typesTitle: "Qué tipo de trabajo",
    types: [
      "Revisión de literatura o revisión bibliográfica",
      "Reflexión y valoración sobre experiencias educativas",
      "Difusión de resultados de investigación",
      "Propuesta de modelo teórico explicativo en torno a un problema",
      "Propuesta de intervención educativa novedosa",
    ],
    original:
      "Los textos deben ser inéditos (no publicados ni aceptados en otra publicación) y pueden escribirse en español, portugués o inglés.",
    review:
      "La Comisión Científica valorará la calidad de las propuestas y, si es necesario, sugerirá mejoras de los resúmenes y de los textos completos.",
    templatesEyebrow: "Plantillas",
    templatesTitle: "Resumen y texto completo",
    templatesLead:
      "Hay dos modalidades de comunicación: el resumen de un proyecto de investigación o de una experiencia y, si quieres, el texto completo, con una descripción amplia del proceso y de los resultados.",
    abstract: {
      title: "Resumen",
      tag: "obligatorio",
      text: "Entre 400 y 500 palabras, con la estructura de la plantilla: introducción, metodología, resultados y discusión.",
    },
    full: {
      title: "Texto completo",
      tag: "opcional",
      text: "Entre 4.000 y 5.000 palabras, referencias bibliográficas incluidas.",
    },
    download: "Descargar la plantilla",
    fileInfo: (kb: number | null) => (kb ? `Word, ${kb} KB` : "Word"),
    axisNote: "Indica en la plantilla el eje temático de tu comunicación.",
    submitTitle: "El envío se hace en EasyChair",
    submitText: "Sube a la plataforma EasyChair del congreso el resumen y, si lo presentas, el texto completo. Allí está publicada también la convocatoria.",
    submitCta: "Ir a EasyChair",
    cfpCta: "Ver la convocatoria",
    ejesEyebrow: "Ejes temáticos",
    ejesTitle: "Los temas de la convocatoria",
    ejesLead: "Cada comunicación indica en la plantilla uno de estos ejes. Las líneas de cada eje son orientativas.",
    talkEyebrow: "Exposición",
    talkTitle: "Cinco minutos por comunicación",
    onsite: {
      title: "Presencial",
      items: [
        "Cada comunicación se expone en 5 minutos.",
        "Si usas una presentación, entrégala a la coordinación de la mesa 10 minutos antes de que empiece, en el aula asignada: en un pendrive o con su enlace.",
        "Tras las exposiciones, la mesa abre un debate sobre las experiencias e investigaciones presentadas.",
      ],
    },
    online: {
      title: "En línea",
      items: [
        "La exposición es síncrona, junto con el resto de autores de la mesa, en la plataforma del congreso; el enlace se envía antes.",
        "Cada comunicación dispone de 5 minutos.",
        "Si no puedes conectarte en directo, sube un vídeo de 5 minutos a la carpeta de tu mesa hasta el 8 de febrero de 2027; la coordinación lo proyectará.",
        "Después, debate con las cuestiones de la coordinación y de los participantes.",
      ],
    },
    slotsTitle: "Paneles de comunicaciones en el programa",
    inProgramme: "Ver en el programa",
    datesEyebrow: "Calendario",
    datesTitle: "Plazos de la convocatoria",
    publication:
      "Las comunicaciones aceptadas se publican en los libros de actas del congreso, en GREDOS, el repositorio de la Universidad de Salamanca, y pueden ser seleccionadas para su publicación en la revista RELATEC.",
    questions: "¿Dudas sobre las comunicaciones? Escribe a la secretaría del congreso:",
  },
  pt: {
    eyebrow: "Comunicações",
    title: "Partilha a tua investigação e a tua experiência",
    lead: (from: string, to: string) =>
      `Submissão de resumos de ${from} a ${to}, em português, espanhol ou inglês. As comunicações são apresentadas no congresso de forma presencial ou online.`,
    meta: "Normas, modelos, eixos temáticos e prazos para apresentar uma comunicação no ieTIC 2027.",
    ctaSubmit: "Submeter no EasyChair",
    ctaTemplates: "Descarregar os modelos",
    rulesEyebrow: "Participação",
    rulesTitle: "Normas para apresentar uma comunicação",
    rules: [
      "Cada autor ou autora pode apresentar um máximo de duas comunicações.",
      "Cada comunicação pode ter um máximo de quatro autores.",
      "Todas as pessoas que assinam a comunicação devem estar inscritas no congresso.",
      "Uma delas apresenta a comunicação no congresso, na modalidade (presencial ou online) em que se inscreveu.",
    ],
    typesTitle: "Que tipo de trabalho",
    types: [
      "Revisão de literatura ou revisão bibliográfica",
      "Reflexão e avaliação sobre experiências educativas",
      "Divulgação de resultados de investigação",
      "Proposta de modelo teórico explicativo em torno de um problema",
      "Proposta de intervenção educativa inovadora",
    ],
    original:
      "Os textos devem ser inéditos (não publicados nem aceites noutra publicação) e podem ser escritos em português, espanhol ou inglês.",
    review:
      "A Comissão Científica avaliará a qualidade das propostas e, se necessário, sugerirá melhorias aos resumos e aos textos completos.",
    templatesEyebrow: "Modelos",
    templatesTitle: "Resumo e texto completo",
    templatesLead:
      "Há duas modalidades de comunicação: o resumo de um projeto de investigação ou de uma experiência e, se quiseres, o texto completo, com uma descrição ampla do processo e dos resultados.",
    abstract: {
      title: "Resumo",
      tag: "obrigatório",
      text: "Entre 400 e 500 palavras, com a estrutura do modelo: introdução, metodologia, resultados e discussão.",
    },
    full: {
      title: "Texto completo",
      tag: "opcional",
      text: "Entre 4000 e 5000 palavras, incluindo as referências bibliográficas.",
    },
    download: "Descarregar o modelo",
    fileInfo: (kb: number | null) => (kb ? `Word, ${kb} KB` : "Word"),
    axisNote: "Indica no modelo o eixo temático da tua comunicação.",
    submitTitle: "A submissão faz-se no EasyChair",
    submitText: "Carrega na plataforma EasyChair do congresso o resumo e, se o apresentares, o texto completo. A chamada também está publicada lá.",
    submitCta: "Ir para o EasyChair",
    cfpCta: "Ver a chamada",
    ejesEyebrow: "Eixos temáticos",
    ejesTitle: "Os temas da chamada",
    ejesLead: "Cada comunicação indica no modelo um destes eixos. As linhas de cada eixo são orientativas.",
    talkEyebrow: "Apresentação",
    talkTitle: "Cinco minutos por comunicação",
    onsite: {
      title: "Presencial",
      items: [
        "Cada comunicação é apresentada em 5 minutos.",
        "Se usares uma apresentação, entrega-a à coordenação da mesa 10 minutos antes do início, na sala atribuída: numa pen USB ou com a respetiva ligação.",
        "Depois das apresentações, a mesa abre um debate sobre as experiências e investigações apresentadas.",
      ],
    },
    online: {
      title: "Online",
      items: [
        "A apresentação é síncrona, com os restantes autores da mesa, na plataforma do congresso; a ligação é enviada previamente.",
        "Cada comunicação dispõe de 5 minutos.",
        "Se não puderes ligar-te em direto, carrega um vídeo de 5 minutos na pasta da tua mesa até 8 de fevereiro de 2027; a coordenação irá projetá-lo.",
        "Segue-se um debate com as questões da coordenação e dos participantes.",
      ],
    },
    slotsTitle: "Painéis de comunicações no programa",
    inProgramme: "Ver no programa",
    datesEyebrow: "Calendário",
    datesTitle: "Prazos da chamada",
    publication:
      "As comunicações aceites são publicadas nos livros de atas do congresso, no GREDOS, o repositório da Universidade de Salamanca, e podem ser selecionadas para publicação na revista RELATEC.",
    questions: "Dúvidas sobre as comunicações? Escreve ao secretariado do congresso:",
  },
} as const;

/** «10 de octubre» / «10 de outubro» */
function dayMonthLong(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "es-ES", { day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

/** Tamaño en KB de un fichero de public/ (null si no se puede leer). */
function fileKB(publicPath: string): number | null {
  try {
    return Math.max(1, Math.round(statSync(path.join(process.cwd(), "public", publicPath)).size / 1024));
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return pageMetadata(locale, "/comunicaciones", T[locale].eyebrow, T[locale].meta);
}

export default async function ComunicacionesPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const t = T[locale];

  const data = await loadProgramme("comunicaciones");
  const panels = data?.sessions.filter((s) => s.type === "COMUNICACIONES") ?? [];

  const opens = FECHAS.find((f) => f.id === "resumenes-apertura");
  const closes = FECHAS.find((f) => f.id === "resumenes-cierre");
  const lead =
    opens?.date && closes?.date ? t.lead(dayMonthLong(opens.date, locale), formatFecha(closes, locale) ?? "") : undefined;

  const templates = [
    { ...t.abstract, file: SITE.submission.templateAbstract },
    { ...t.full, file: SITE.submission.templateFull },
  ];

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={lead} art={<PageArt />} color={sectionColor("/comunicaciones")}>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={SITE.submission.easychair} target="_blank" rel="noopener noreferrer" className="boton-oro">
            {t.ctaSubmit} <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
          <a href="#plantillas" className="boton-contorno-claro">
            {t.ctaTemplates} <ArrowDownToLine className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </PageHeader>

      {/* Normas de participación */}
      <section className="py-20 sm:py-24">
        <div className="contenedor grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow={t.rulesEyebrow} title={t.rulesTitle} />
            <ul className="mt-8 space-y-3 text-[1.0625rem] leading-relaxed text-tinta-suave">
              {t.rules.map((r) => (
                <li key={r} className="flex gap-3">
                  <span className="mt-[0.8em] h-px w-3 shrink-0 bg-oro-500" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-2xl leading-relaxed text-tinta-suave">{t.original}</p>
          </div>
          <aside className="lg:col-span-5" data-reveal style={{ ["--d" as string]: "150ms" }}>
            <div className="tarjeta p-7">
              <h3 className="font-display text-xl font-bold">{t.typesTitle}</h3>
              <ul className="mt-4 space-y-2.5 text-[0.95rem] leading-snug text-tinta-suave">
                {t.types.map((x) => (
                  <li key={x} className="flex gap-3">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-mar-600" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-linea pt-5 text-sm leading-relaxed text-tinta-suave">{t.review}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* Plantillas y envío */}
      <section id="plantillas" className="scroll-mt-24 border-y border-linea bg-papel py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading eyebrow={t.templatesEyebrow} title={t.templatesTitle} lead={t.templatesLead} />
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {templates.map((tpl, i) => (
              <li key={tpl.file} data-reveal style={{ ["--d" as string]: `${i * 110}ms` }} className="tarjeta flex flex-col p-6 sm:p-7">
                <p className="flex items-baseline gap-3">
                  <span className="font-display text-xl font-bold">{tpl.title}</span>
                  <span className="nota text-mar-700">{tpl.tag}</span>
                </p>
                <p className="mt-3 flex-1 leading-relaxed text-tinta-suave">{tpl.text}</p>
                <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a href={tpl.file} download className="boton-mar">
                    <ArrowDownToLine className="h-4 w-4" aria-hidden /> {t.download}
                  </a>
                  <span className="text-sm text-tinta-tenue">{t.fileInfo(fileKB(tpl.file))}</span>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-tinta-suave">{t.axisNote}</p>

          <div
            data-reveal="escala"
            className="mt-10 flex flex-col gap-6 rounded-xl bg-noche-900 p-7 text-white sm:p-9 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="max-w-2xl">
              <p className="font-display text-xl font-bold">{t.submitTitle}</p>
              <p className="mt-2 text-white/75">{t.submitText}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3 self-start lg:self-auto">
              <a href={SITE.submission.easychair} target="_blank" rel="noopener noreferrer" className="boton-oro">
                {t.submitCta} <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
              <a href={SITE.submission.cfp} target="_blank" rel="noopener noreferrer" className="boton-contorno-claro">
                {t.cfpCta} <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Ejes */}
      <section className="py-20 sm:py-24">
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

      {/* Exposición en el congreso */}
      <section className="border-y border-linea bg-papel py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading eyebrow={t.talkEyebrow} title={t.talkTitle} />
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              { ...t.onsite, Icon: Presentation },
              { ...t.online, Icon: MonitorPlay },
            ].map(({ title, items, Icon }, i) => (
              <li key={title} data-reveal style={{ ["--d" as string]: `${i * 110}ms` }} className="tarjeta p-6 sm:p-7">
                <h3 className="flex items-center gap-3 font-display text-xl font-bold">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-mar-50 text-mar-600">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  {title}
                </h3>
                <ul className="mt-5 space-y-2.5 leading-relaxed text-tinta-suave">
                  {items.map((x) => (
                    <li key={x} className="flex gap-3">
                      <span className="mt-[0.8em] h-px w-3 shrink-0 bg-oro-500" aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          {panels.length > 0 && data && (
            <div className="mt-10 max-w-3xl">
              <h3 className="nota text-mar-700">{t.slotsTitle}</h3>
              <ul className="mt-3 divide-y divide-linea overflow-hidden rounded-lg border border-linea bg-white">
                {panels.map((s) => {
                  const loc = sessionLocation(s, data!, locale);
                  return (
                    <li key={s.id}>
                      <Link
                        href={`${href(locale, "/programa")}?sesion=${s.id}`}
                        className="group flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm transition hover:bg-papel"
                        aria-label={`${shortDay(s.day, locale)} ${monthShort(s.day, locale)}, ${s.start}–${s.end}. ${t.inProgramme}`}
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
            </div>
          )}
        </div>
      </section>

      {/* Calendario y publicación */}
      <section className="py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading eyebrow={t.datesEyebrow} title={t.datesTitle} />
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {GRUPOS_FECHA.filter((g) => g.id !== "congreso").map((g, gi) => (
              <div key={g.id} data-reveal style={{ ["--d" as string]: `${gi * 90}ms` }}>
                <h3 className="nota text-mar-700">{pick(g.label, locale)}</h3>
                <ol className="mt-4 space-y-4 border-l border-linea pl-5">
                  {FECHAS.filter((f) => f.group === g.id).map((f) => (
                    <li key={f.id} className="relative">
                      <span className="absolute -left-[1.53rem] top-[0.45rem] h-2 w-2 rounded-full bg-oro-500" aria-hidden />
                      <p className="font-display text-[0.95rem] font-semibold text-tinta">
                        {formatFecha(f, locale) ?? pick(UI.pending, locale)}
                      </p>
                      <p className="text-sm leading-snug text-tinta-suave">{pick(f.label, locale)}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <p className="mt-12 max-w-3xl leading-relaxed text-tinta-suave">{t.publication}</p>
          <p className="mt-6 flex flex-wrap items-center gap-2 text-tinta-suave">
            <Mail className="h-4 w-4 text-mar-600" aria-hidden />
            {t.questions}{" "}
            <a className="enlace" href={`mailto:${SITE.contact.secretaria}`}>
              {SITE.contact.secretaria}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
