import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { FacetPattern } from "@/components/art/FacetPattern";
import { EditionsTimeline } from "@/components/congreso/editions-timeline";
import { EjeIcon } from "@/components/ui/eje-icon";
import { PageArt } from "@/components/ui/page-art";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { EJES } from "@/content/ejes";
import { IETIC_SERIE } from "@/content/site";
import { sectionColor } from "@/content/ui";
import { CountUp } from "@/components/ui/count-up";
import { href, isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { loadProgramme } from "@/lib/programme-data";
import { SESSION_TYPE_META, type SessionTypeKey } from "@/lib/session-types";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    eyebrow: "El congreso",
    title: "Innovación educativa con TIC, en abierto",
    lead: "La Conferencia Ibérica de Innovación en la Educación con TIC llega a Salamanca en su XIII edición, en modalidad híbrida: presencial y en línea.",
    aboutEyebrow: "Presentación",
    aboutTitle: "Un punto de encuentro ibérico",
    // Texto oficial de la organización (documento del 01-10-2026)
    about: [
      "El consorcio formado por la red de universidades hispano-lusa UPB/USAL/UAberta/UNED, en la que participan el Departamento de Tecnologia Educativa e Gestão de Informação de la Escuela Superior de Educación de la Universidade Politécnica de Bragança en Portugal, el Departamento de Didáctica, Organización y Métodos de Investigación y el Instituto Universitario de Ciencias de la Educación (IUCE) de la Universidad de Salamanca en España, la Unidad de Desarrollo de Centros Locales de Aprendizaje de la Universidad Aberta en Portugal y el Departamento de Didáctica, Organización Escolar y Didácticas Especiales de la Facultad de Educación de la UNED en España, con la colaboración de la Asociación de Atención Temprana AMPA, presentan la XIII edición de la Conferencia Ibérica de Innovación en la Educación con Tecnologías de la Información y Comunicación (ieTIC 2027), que se realizará en modalidad híbrida (presencial y virtual) los días 11 y 12 de febrero de 2027, situándose la sede en la ciudad de Salamanca.",
      "El congreso ofrecerá conferencias, mesas redondas, talleres formativos y mesas de comunicaciones sobre los ejes temáticos propuestos.",
      "Los temas abordados en ieTIC 2027 responden a la temática «Tecnologías para mejorar el aprendizaje en el ecosistema de Ciencia Abierta. Recursos Educativos Abiertos y Diseño Universal de Aprendizaje».",
      "Se abordarán cuestiones de gran actualidad para los profesionales de la educación preocupados por los grandes desafíos de las tecnologías relacionados con la educación actual y la profesionalización docente: tecnologías inclusivas, recursos educativos abiertos, ciencia abierta, bienestar digital, gamificación y narrativas inmersivas, impacto de la inteligencia artificial en la función docente y el aprendizaje de los estudiantes, etc.",
      "El encuentro pretende ser una oportunidad para la reflexión, el conocimiento de experiencias desarrolladas en la práctica educativa y la difusión de resultados de investigación, así como el trabajo colaborativo de profesionales de diversos niveles educativos para proponer líneas y encontrar estrategias de actuación que permitan contribuir a un futuro educativo basado en valores compartidos de justicia social, accesibilidad, apertura y bienestar.",
      "Un evento que pretende contribuir al desarrollo profesional docente en el ámbito de la competencia digital, la innovación didáctica y la mejora de los procesos de aprendizaje.",
    ],
    formatEyebrow: "Formato",
    formatTitle: "Qué encontrarás",
    ejesEyebrow: "Ejes temáticos",
    ejesTitle: "Seis ejes temáticos",
    ejesLead: "Cada comunicación indica uno de estos ejes; sus líneas son orientativas.",
    audienceEyebrow: "Participantes",
    audienceTitle: "¿A quién se dirige?",
    audience: [
      "Profesorado de todos los niveles educativos, de infantil a la universidad.",
      "Personal investigador en tecnología educativa e innovación docente.",
      "Estudiantado de doctorado, máster y grado del ámbito de la educación.",
      "Equipos directivos, coordinación TIC y responsables de innovación de los centros.",
      "Profesionales vinculados a la formación y al diseño de recursos educativos.",
    ],
    historyEyebrow: "Trayectoria",
    historyTitle: "Una conferencia ibérica",
    historyLead: "ieTIC nació en 2011 de la colaboración entre instituciones de España y Portugal y ha recorrido distintas sedes a ambos lados de la frontera. Estas son sus ediciones, con los libros de actas publicados:",
    thisEdition: "esta edición",
    linkLabels: { actas: "Actas", resumenes: "Resúmenes", web: "Web" },
    seriesWeb: "Web de la serie ieTIC (UPB)",
    proceedingsNote: "Actas en el repositorio de la Universidade Politécnica de Bragança.",
    ctaProgramme: "Ver el programa",
  },
  pt: {
    eyebrow: "O congresso",
    title: "Inovação educativa com TIC, em aberto",
    lead: "A Conferência Ibérica de Inovação na Educação com TIC chega a Salamanca na sua XIII edição, em modalidade híbrida: presencial e online.",
    aboutEyebrow: "Apresentação",
    aboutTitle: "Um ponto de encontro ibérico",
    // Tradução própria do texto oficial (revisão pela organização pendente)
    about: [
      "O consórcio formado pela rede de universidades luso-espanhola UPB/USAL/UAberta/UNED, na qual participam o Departamento de Tecnologia Educativa e Gestão de Informação da Escola Superior de Educação da Universidade Politécnica de Bragança, em Portugal, o Departamento de Didática, Organização e Métodos de Investigação e o Instituto Universitário de Ciências da Educação (IUCE) da Universidade de Salamanca, em Espanha, a Unidade de Desenvolvimento de Centros Locais de Aprendizagem da Universidade Aberta, em Portugal, e o Departamento de Didática, Organização Escolar e Didáticas Especiais da Faculdade de Educação da UNED, em Espanha, com a colaboração da Asociación de Atención Temprana AMPA, apresenta a XIII edição da Conferência Ibérica de Inovação na Educação com Tecnologias da Informação e Comunicação (ieTIC 2027), que se realizará em modalidade híbrida (presencial e virtual) nos dias 11 e 12 de fevereiro de 2027, com sede na cidade de Salamanca.",
      "O congresso incluirá conferências, mesas-redondas, oficinas de formação e mesas de comunicações sobre os eixos temáticos propostos.",
      "Os temas abordados no ieTIC 2027 respondem ao tema «Tecnologias para melhorar a aprendizagem no ecossistema da Ciência Aberta. Recursos Educativos Abertos e Desenho Universal para a Aprendizagem».",
      "Serão abordadas questões de grande atualidade para os profissionais da educação preocupados com os grandes desafios das tecnologias na educação atual e na profissionalização docente: tecnologias inclusivas, recursos educativos abertos, ciência aberta, bem-estar digital, gamificação e narrativas imersivas, impacto da inteligência artificial na função docente e na aprendizagem dos estudantes, entre outras.",
      "O encontro pretende ser uma oportunidade de reflexão, de conhecimento de experiências desenvolvidas na prática educativa e de divulgação de resultados de investigação, bem como de trabalho colaborativo entre profissionais de diferentes níveis de ensino para propor linhas e encontrar estratégias de ação que contribuam para um futuro educativo assente em valores partilhados de justiça social, acessibilidade, abertura e bem-estar.",
      "Um evento que pretende contribuir para o desenvolvimento profissional docente no âmbito da competência digital, da inovação didática e da melhoria dos processos de aprendizagem.",
    ],
    formatEyebrow: "Formato",
    formatTitle: "O que vais encontrar",
    ejesEyebrow: "Eixos temáticos",
    ejesTitle: "Seis eixos temáticos",
    ejesLead: "Cada comunicação indica um destes eixos; as suas linhas são orientativas.",
    audienceEyebrow: "Participantes",
    audienceTitle: "A quem se dirige?",
    audience: [
      "Professores de todos os níveis de ensino, da educação de infância à universidade.",
      "Investigadores em tecnologia educativa e inovação pedagógica.",
      "Estudantes de doutoramento, mestrado e licenciatura da área da educação.",
      "Direções, coordenação TIC e responsáveis pela inovação nas escolas.",
      "Profissionais ligados à formação e ao design de recursos educativos.",
    ],
    historyEyebrow: "Percurso",
    historyTitle: "Uma conferência ibérica",
    historyLead: "O ieTIC nasceu em 2011 da colaboração entre instituições de Espanha e Portugal e tem percorrido diferentes locais dos dois lados da fronteira. Estas são as suas edições, com os livros de atas publicados:",
    thisEdition: "esta edição",
    linkLabels: { actas: "Atas", resumenes: "Resumos", web: "Web" },
    seriesWeb: "Sítio da série ieTIC (UPB)",
    proceedingsNote: "Atas no repositório da Universidade Politécnica de Bragança.",
    ctaProgramme: "Ver o programa",
  },
} as const;

/** Tipos que se enseñan en «Qué encontrarás» (el resto son logística). */
const FORMAT_TYPES: SessionTypeKey[] = [
  "PONENCIA",
  "PANEL_EXPERTOS",
  "MESA_REDONDA",
  "TALLER",
  "COMUNICACIONES",
  "PROYECTOS",
  "SOCIAL",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return pageMetadata(locale, "/congreso", T[locale].eyebrow, T[locale].lead);
}

export default async function CongresoPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const t = T[locale];

  const data = await loadProgramme("congreso");
  const counts: { type: SessionTypeKey; n: number }[] = data
    ? FORMAT_TYPES.map((type) => {
        const list = data.sessions.filter((s) => s.type === type);
        // Los talleres van como contribuciones de una sola sesión: se cuentan uno a uno
        const talleres = type === "TALLER" ? list.reduce((n, s) => n + s.talks.length, 0) : 0;
        return { type, n: talleres || list.length };
      }).filter((c) => c.n > 0)
    : [];

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead} art={<PageArt />} color={sectionColor("/congreso")} />

      {/* Presentación + a quién se dirige */}
      <section className="py-20 sm:py-24">
        <div className="contenedor grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow={t.aboutEyebrow} title={t.aboutTitle} />
            <div className="prosa mt-6">
              {t.about.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          <aside className="lg:col-span-5" data-reveal style={{ ["--d" as string]: "150ms" }}>
            <div className="tarjeta p-7">
              <p className="antetitulo">{t.audienceEyebrow}</p>
              <h2 className="mt-3 font-display text-2xl font-bold">{t.audienceTitle}</h2>
              <ul className="mt-5 space-y-3">
                {t.audience.map((a) => (
                  <li key={a} className="flex gap-3 text-[0.95rem] leading-snug text-tinta-suave">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-mar-600" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Formato (del programa) */}
      {counts.length > 0 && (
        <section className="border-y border-linea bg-papel py-16 sm:py-20">
          <div className="contenedor">
            <SectionHeading eyebrow={t.formatEyebrow} title={t.formatTitle} />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {counts.map(({ type, n }, i) => {
                const meta = SESSION_TYPE_META[type];
                return (
                  <li key={type} data-reveal style={{ ["--d" as string]: `${i * 80}ms` }} className="tarjeta eleva flex items-center gap-4 p-5">
                    <span className="font-display text-3xl font-extrabold" style={{ color: meta.color }}>
                      <CountUp value={n} duration={900} />
                    </span>
                    <span className="text-sm font-medium leading-snug text-tinta">{(n === 1 ? meta.label : meta.plural)[locale]}</span>
                  </li>
                );
              })}
            </ul>
            <Link href={href(locale, "/programa")} className="boton-mar mt-10">
              {t.ctaProgramme} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      )}

      {/* Ejes temáticos */}
      <section id="ejes" className="py-20 sm:py-24" aria-labelledby="ejes-titulo">
        <div className="contenedor">
          <SectionHeading eyebrow={t.ejesEyebrow} title={t.ejesTitle} lead={t.ejesLead} id="ejes-titulo" />
          <ol className="mt-12 grid gap-5 md:grid-cols-2">
            {EJES.map((eje, i) => (
              <li key={eje.id} id={`eje-${eje.id}`} data-reveal style={{ ["--d" as string]: `${(i % 2) * 90}ms` }} className="tarjeta eleva scroll-mt-40 p-7">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-noche-900 text-cian-300">
                    <EjeIcon icon={eje.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="font-display text-xl font-bold leading-snug">{pick(eje.title, locale)}</h3>
                </div>
                <ul className="mt-5 space-y-2.5 border-t border-linea pt-5">
                  {pick(eje.lines, locale).map((line) => (
                    <li key={line} className="flex gap-3 text-[0.95rem] leading-snug text-tinta-suave">
                      <span className="mt-[0.7em] h-px w-2.5 shrink-0 bg-oro-500" aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trayectoria */}
      <section className="relative isolate overflow-hidden bg-noche-900 py-20 text-white sm:py-24">
        <FacetPattern className="-z-10" seed={23} />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0%,rgba(22,116,146,0.45),transparent_55%)]"
          aria-hidden
        />
        <div className="contenedor">
          <SectionHeading eyebrow={t.historyEyebrow} title={t.historyTitle} lead={t.historyLead} dark />
          <EditionsTimeline locale={locale} labels={t.linkLabels} thisEdition={t.thisEdition} />
          <p className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
            <a href={IETIC_SERIE.web} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cian-200 hover:text-white">
              {t.seriesWeb} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
            <span>{t.proceedingsNote}</span>
          </p>
        </div>
      </section>
    </>
  );
}
