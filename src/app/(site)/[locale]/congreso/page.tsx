import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { FacetPattern } from "@/components/art/FacetPattern";
import { EjeIcon } from "@/components/ui/eje-icon";
import { PageArt } from "@/components/ui/page-art";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { EJES } from "@/content/ejes";
import { EDICIONES, SITE } from "@/content/site";
import { UI } from "@/content/ui";
import { href, isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getProgramme } from "@/lib/programme";
import { SESSION_TYPE_META, type SessionTypeKey } from "@/lib/session-types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    eyebrow: "El congreso",
    title: "Innovación educativa con TIC, en abierto",
    lead: "La Conferencia Ibérica de Innovación en Educación con TIC llega a Salamanca en su XIII edición.",
    aboutEyebrow: "Presentación",
    aboutTitle: "Un punto de encuentro ibérico",
    about: [
      "ieTIC es un punto de encuentro de la comunidad ibérica de tecnología educativa. En cada edición, docentes, investigadores y profesionales de la educación de España y Portugal comparten investigaciones, experiencias de aula y proyectos que exploran cómo las tecnologías pueden mejorar la enseñanza y el aprendizaje.",
      "La XIII edición se celebra los días 11 y 12 de febrero de 2027 en el Instituto Universitario de Ciencias de la Educación (IUCE) de la Universidad de Salamanca, bajo el lema «Tecnologías para mejorar el aprendizaje en el ecosistema de Ciencia Abierta. Recursos Educativos Abiertos y Diseño Universal de Aprendizaje».",
      "El lema pone el foco en una educación más abierta y accesible: recursos que se comparten, se reutilizan y se mejoran en comunidad; diseños de aprendizaje pensados desde el principio para la diversidad del alumnado, y prácticas de docencia e investigación alineadas con los principios de la Ciencia Abierta.",
    ],
    formatEyebrow: "Formato",
    formatTitle: "Qué encontrarás",
    ejesEyebrow: "Ejes temáticos",
    ejesTitle: "Seis ejes temáticos",
    ejesLead: "Las comunicaciones deberán inscribirse en uno de estos ejes.",
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
    historyLead: "ieTIC nació de la colaboración entre instituciones de España y Portugal y ha recorrido distintas sedes a ambos lados de la frontera. Algunas paradas del camino:",
    ctaProgramme: "Ver el programa",
  },
  pt: {
    eyebrow: "O congresso",
    title: "Inovação educativa com TIC, em aberto",
    lead: "A Conferência Ibérica de Inovação na Educação com TIC chega a Salamanca na sua XIII edição.",
    aboutEyebrow: "Apresentação",
    aboutTitle: "Um ponto de encontro ibérico",
    about: [
      "O ieTIC é um ponto de encontro da comunidade ibérica de tecnologia educativa. Em cada edição, docentes, investigadores e profissionais da educação de Espanha e Portugal partilham investigações, experiências de sala de aula e projetos que exploram como as tecnologias podem melhorar o ensino e a aprendizagem.",
      "A XIII edição realiza-se nos dias 11 e 12 de fevereiro de 2027 no Instituto Universitário de Ciências da Educação (IUCE) da Universidade de Salamanca, sob o lema «Tecnologias para melhorar a aprendizagem no ecossistema da Ciência Aberta. Recursos Educativos Abertos e Desenho Universal para a Aprendizagem».",
      "O lema coloca o foco numa educação mais aberta e acessível: recursos que se partilham, reutilizam e melhoram em comunidade; desenhos de aprendizagem pensados desde o início para a diversidade dos alunos, e práticas de ensino e investigação alinhadas com os princípios da Ciência Aberta.",
    ],
    formatEyebrow: "Formato",
    formatTitle: "O que vais encontrar",
    ejesEyebrow: "Eixos temáticos",
    ejesTitle: "Seis eixos temáticos",
    ejesLead: "As comunicações deverão enquadrar-se num destes eixos.",
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
    historyLead: "O ieTIC nasceu da colaboração entre instituições de Espanha e Portugal e tem percorrido diferentes locais dos dois lados da fronteira. Algumas paragens do caminho:",
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

  let counts: { type: SessionTypeKey; n: number }[] = [];
  try {
    const data = await getProgramme();
    counts = FORMAT_TYPES.map((type) => ({ type, n: data.sessions.filter((s) => s.type === type).length })).filter((c) => c.n > 0);
  } catch (e) {
    console.error("[congreso] programa no disponible:", e);
  }

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead} art={<PageArt />} />

      {/* Presentación + a quién se dirige */}
      <section className="py-20 sm:py-24">
        <div className="contenedor grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading index="01" eyebrow={t.aboutEyebrow} title={t.aboutTitle} />
            <div className="prosa mt-6">
              {t.about.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          <aside className="lg:col-span-5">
            <div className="tarjeta p-7">
              <p className="antetitulo">{t.audienceEyebrow}</p>
              <h2 className="mt-3 font-display text-2xl font-bold">{t.audienceTitle}</h2>
              <ul className="mt-5 space-y-3">
                {t.audience.map((a) => (
                  <li key={a} className="flex gap-3 text-[0.95rem] leading-snug text-tinta-suave">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mar-50 text-mar-600">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
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
            <SectionHeading index="02" eyebrow={t.formatEyebrow} title={t.formatTitle} />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {counts.map(({ type, n }) => {
                const meta = SESSION_TYPE_META[type];
                return (
                  <li key={type} className="tarjeta flex items-center gap-4 p-5">
                    <span className="font-display text-3xl font-extrabold" style={{ color: meta.color }}>
                      {n}
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
          <SectionHeading index="03" eyebrow={t.ejesEyebrow} title={t.ejesTitle} lead={t.ejesLead} id="ejes-titulo" />
          <ol className="mt-12 grid gap-5 md:grid-cols-2">
            {EJES.map((eje, i) => (
              <li key={eje.id} id={`eje-${eje.id}`} className="tarjeta scroll-mt-40 p-7">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-noche-900 text-cian-300">
                    <EjeIcon icon={eje.icon} className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-mono text-xs text-mar-600">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="font-display text-xl font-bold leading-snug">{pick(eje.title, locale)}</h3>
                  </div>
                </div>
                <ul className="mt-5 space-y-2.5 border-t border-linea pt-5">
                  {pick(eje.lines, locale).map((line) => (
                    <li key={line} className="flex gap-3 text-[0.95rem] leading-snug text-tinta-suave">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-oro-500" aria-hidden />
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
          <SectionHeading index="04" eyebrow={t.historyEyebrow} title={t.historyTitle} lead={t.historyLead} dark />
          <ol className="relative mt-14 grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
            <span className="absolute left-0 right-0 top-[1.15rem] hidden h-px bg-gradient-to-r from-cian-300/10 via-cian-300/40 to-oro-400 lg:block" aria-hidden />
            {EDICIONES.map((e) => (
              <li key={e.year} className="relative">
                <span
                  className={
                    e.current
                      ? "relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-oro-400 text-noche-900 shadow-[0_0_24px_rgba(235,174,63,0.6)]"
                      : "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-cian-300/40 bg-noche-800 text-cian-300"
                  }
                >
                  <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
                </span>
                <p className={e.current ? "mt-4 font-display text-2xl font-bold text-oro-300" : "mt-4 font-display text-2xl font-bold text-white"}>
                  {e.year}
                </p>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-cian-300/80">
                  {e.edition} · {pick(e.place, locale)}
                </p>
                {e.note && <p className="mt-2 text-sm leading-snug text-white/60">{pick(e.note, locale)}</p>}
              </li>
            ))}
          </ol>
          <p className="mt-12 text-sm text-white/50">
            {pick(SITE.seriesName, locale)} · {pick(UI.organiza, locale)}: {pick(SITE.venue.short, locale)}
          </p>
        </div>
      </section>
    </>
  );
}
