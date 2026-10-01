import type { Metadata } from "next";
import { ArrowUpRight, Check, Mail, Phone } from "lucide-react";
import { DateMark } from "@/components/ui/date-mark";
import { PageArt } from "@/components/ui/page-art";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { FECHAS, formatFecha } from "@/content/fechas";
import { CUOTAS, INCLUYE } from "@/content/inscripcion";
import { SITE } from "@/content/site";
import { sectionColor, UI } from "@/content/ui";
import { isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    eyebrow: "Inscripción",
    title: "Inscríbete en ieTIC 2027",
    lead: (reduced: string) => `Participa de forma presencial o en línea. La tarifa reducida se mantiene hasta el ${reduced}.`,
    meta: "Cuotas, qué incluye y cómo inscribirse en ieTIC 2027.",
    feesEyebrow: "Cuotas",
    feesTitle: "Precios de inscripción",
    colMode: "Modalidad",
    colReduced: "Tarifa reducida",
    colRegular: "Tarifa ordinaria",
    until: (d: string) => `hasta el ${d}`,
    includesEyebrow: "Qué incluye",
    includesTitle: "Lo que incluye cada modalidad",
    online: "En línea",
    onsite: "Presencial",
    stepsEyebrow: "Pasos",
    stepsTitle: "Cómo inscribirte",
    step1: {
      kicker: "Primero",
      title: "Rellena el formulario previo",
      text: "Antes de inscribirte, completa el formulario del congreso.",
      cta: "Abrir el formulario",
    },
    step2: {
      kicker: "Después",
      title: "Inscripción y pago",
      text: "Se hacen en el Centro de Formación Permanente de la Universidad de Salamanca. Busca el congreso en el listado de cursos con este nombre:",
      cta: "Ir al Centro de Formación Permanente",
    },
    helpBilling: "Inscripción y facturación",
    helpBillingWho: "Centro de Formación Permanente de la Universidad de Salamanca",
    helpOther: "Otras consultas",
    ext: "ext.",
  },
  pt: {
    eyebrow: "Inscrição",
    title: "Inscreve-te no ieTIC 2027",
    lead: (reduced: string) => `Participa de forma presencial ou online. A tarifa reduzida mantém-se até ${reduced}.`,
    meta: "Taxas, o que inclui e como fazer a inscrição no ieTIC 2027.",
    feesEyebrow: "Taxas",
    feesTitle: "Taxas de inscrição",
    colMode: "Modalidade",
    colReduced: "Tarifa reduzida",
    colRegular: "Tarifa normal",
    until: (d: string) => `até ${d}`,
    includesEyebrow: "O que inclui",
    includesTitle: "O que inclui cada modalidade",
    online: "Online",
    onsite: "Presencial",
    stepsEyebrow: "Passos",
    stepsTitle: "Como fazer a inscrição",
    step1: {
      kicker: "Primeiro",
      title: "Preenche o formulário prévio",
      text: "Antes de te inscreveres, preenche o formulário do congresso.",
      cta: "Abrir o formulário",
    },
    step2: {
      kicker: "Depois",
      title: "Inscrição e pagamento",
      text: "Fazem-se no Centro de Formação Permanente da Universidade de Salamanca. Procura o congresso na lista de cursos com este nome:",
      cta: "Ir para o Centro de Formação Permanente",
    },
    helpBilling: "Inscrição e faturação",
    helpBillingWho: "Centro de Formação Permanente da Universidade de Salamanca",
    helpOther: "Outras consultas",
    ext: "ext.",
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return pageMetadata(locale, "/inscripcion", T[locale].eyebrow, T[locale].meta);
}

export default async function InscripcionPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const t = T[locale];

  const fecha = (id: string) => {
    const f = FECHAS.find((x) => x.id === id);
    return (f && formatFecha(f, locale)) ?? pick(UI.pending, locale);
  };
  const reduced = fecha("inscripcion-reducida");
  const regular = fecha("inscripcion-ordinaria");
  const eur = (n: number) =>
    new Intl.NumberFormat(locale === "pt" ? "pt-PT" : "es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const steps = [
    { ...t.step1, url: SITE.registration.form },
    { ...t.step2, url: SITE.registration.payment, course: SITE.registration.courseName },
  ];

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead(reduced)} art={<PageArt />} color={sectionColor("/inscripcion")}>
        <DateMark locale={locale} className="mt-8" />
      </PageHeader>

      {/* Cuotas */}
      <section className="py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading eyebrow={t.feesEyebrow} title={t.feesTitle} />
          <div data-reveal className="mt-10 overflow-hidden rounded-xl border border-linea bg-white shadow-tarjeta">
            <table className="w-full text-left">
              <caption className="sr-only">{t.feesTitle}</caption>
              <thead className="bg-noche-900 text-white">
                <tr>
                  <th scope="col" className="px-3 py-4 align-bottom font-display text-sm font-semibold sm:px-6">
                    {t.colMode}
                  </th>
                  {[
                    { label: t.colReduced, until: reduced },
                    { label: t.colRegular, until: regular },
                  ].map((c) => (
                    <th key={c.label} scope="col" className="px-3 py-4 align-bottom sm:px-6">
                      <span className="block font-display text-sm font-semibold">{c.label}</span>
                      <span className="nota block text-cian-200">{t.until(c.until)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-linea">
                {CUOTAS.map((c) => (
                  <tr key={c.id}>
                    <th scope="row" className="px-3 py-5 font-medium leading-snug text-tinta sm:px-6">
                      {pick(c.label, locale)}
                    </th>
                    <td className="whitespace-nowrap px-3 py-5 font-display text-xl font-bold tabular-nums text-mar-700 sm:px-6 sm:text-2xl">
                      {eur(c.reduced)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-5 font-display text-xl font-bold tabular-nums text-tinta sm:px-6 sm:text-2xl">
                      {eur(c.regular)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="border-y border-linea bg-papel py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading eyebrow={t.includesEyebrow} title={t.includesTitle} />
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              { title: t.onsite, items: pick(INCLUYE.presencial, locale) },
              { title: t.online, items: pick(INCLUYE.online, locale) },
            ].map((m, i) => (
              <li key={m.title} data-reveal style={{ ["--d" as string]: `${i * 110}ms` }} className="tarjeta p-6 sm:p-7">
                <h3 className="font-display text-xl font-bold">{m.title}</h3>
                <ul className="mt-4 space-y-2.5 text-[0.95rem] leading-snug text-tinta-suave">
                  {m.items.map((x) => (
                    <li key={x} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-mar-600" aria-hidden />
                      {x}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Cómo inscribirse */}
      <section className="py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading eyebrow={t.stepsEyebrow} title={t.stepsTitle} />
          <ol className="mt-10 grid gap-6 md:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.url} data-reveal style={{ ["--d" as string]: `${i * 110}ms` }} className="tarjeta flex flex-col p-6 sm:p-7">
                <p className="nota text-mar-700">{s.kicker}</p>
                <h3 className="mt-1 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-tinta-suave">{s.text}</p>
                {"course" in s && s.course && (
                  <p className="mt-3 rounded-r-md border-l-2 border-oro-400 bg-oro-50/70 px-4 py-2.5 text-sm font-medium leading-snug text-tinta">
                    {s.course}
                  </p>
                )}
                <p className="mt-auto pt-6">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="boton-mar">
                    {s.cta} <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Dudas */}
      <section className="border-t border-linea bg-papel py-14">
        <div className="contenedor grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="nota text-mar-700">{t.helpBilling}</h3>
            <p className="mt-2 font-medium text-tinta">{t.helpBillingWho}</p>
            <p className="mt-2 flex items-center gap-2 text-tinta-suave">
              <Mail className="h-4 w-4 text-mar-600" aria-hidden />
              <a className="enlace" href={`mailto:${SITE.registration.helpEmail}`}>
                {SITE.registration.helpEmail}
              </a>
            </p>
            <p className="mt-1 flex items-center gap-2 text-tinta-suave">
              <Phone className="h-4 w-4 text-mar-600" aria-hidden />
              <a className="enlace" href={`tel:+34${SITE.registration.helpPhone.replace(/\s/g, "")}`}>
                {SITE.registration.helpPhone}
              </a>
              <span>
                ({t.ext} {SITE.registration.helpExt})
              </span>
            </p>
          </div>
          <div>
            <h3 className="nota text-mar-700">{t.helpOther}</h3>
            <p className="mt-2 font-medium text-tinta">{pick(UI.contactSecretaria, locale)}</p>
            <p className="mt-2 flex items-center gap-2 text-tinta-suave">
              <Mail className="h-4 w-4 text-mar-600" aria-hidden />
              <a className="enlace" href={`mailto:${SITE.contact.secretaria}`}>
                {SITE.contact.secretaria}
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
