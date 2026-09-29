import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, Mail, Ticket } from "lucide-react";
import { DateMark } from "@/components/ui/date-mark";
import { PageArt } from "@/components/ui/page-art";
import { PageHeader } from "@/components/ui/page-header";
import { PendingNote } from "@/components/ui/pending-note";
import { SITE } from "@/content/site";
import { sectionColor } from "@/content/ui";
import { href, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    eyebrow: "Inscripción",
    title: "Inscríbete en ieTIC 2027",
    lead: "La inscripción da acceso a las dos jornadas del congreso en Salamanca.",
    pendingTitle: "Cuotas e inscripción: próximamente",
    pendingText: "Publicaremos aquí las cuotas (con tarifa reducida para inscripciones anticipadas), lo que incluye cada modalidad y el enlace a la plataforma de inscripción y pago.",
    meanwhile: "Mientras tanto",
    cards: [
      { title: "Consulta el programa", text: "Ponencias, talleres y paneles de comunicaciones, sesión a sesión.", path: "/programa", icon: "calendar" },
      { title: "Prepara tu comunicación", text: "Seis ejes temáticos para presentar tu investigación o experiencia.", path: "/comunicaciones", icon: "ticket" },
    ],
    contact: "¿Dudas? Escríbenos",
  },
  pt: {
    eyebrow: "Inscrição",
    title: "Inscreve-te no ieTIC 2027",
    lead: "A inscrição dá acesso aos dois dias do congresso em Salamanca.",
    pendingTitle: "Taxas e inscrição: brevemente",
    pendingText: "Publicaremos aqui as taxas (com tarifa reduzida para inscrições antecipadas), o que inclui cada modalidade e a ligação para a plataforma de inscrição e pagamento.",
    meanwhile: "Entretanto",
    cards: [
      { title: "Consulta o programa", text: "Conferências, oficinas e painéis de comunicações, sessão a sessão.", path: "/programa", icon: "calendar" },
      { title: "Prepara a tua comunicação", text: "Seis eixos temáticos para apresentar a tua investigação ou experiência.", path: "/comunicaciones", icon: "ticket" },
    ],
    contact: "Dúvidas? Escreve-nos",
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return pageMetadata(locale, "/inscripcion", T[locale].eyebrow, T[locale].lead);
}

export default async function InscripcionPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const t = T[locale];

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead} art={<PageArt />} color={sectionColor("/inscripcion")}>
        <DateMark locale={locale} className="mt-8" />
      </PageHeader>
      <section className="py-16 sm:py-20">
        <div className="contenedor max-w-4xl">
          <PendingNote title={t.pendingTitle}>{t.pendingText}</PendingNote>
          <h2 className="mt-14 font-display text-2xl font-bold">{t.meanwhile}</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {t.cards.map((c, i) => (
              <li key={c.path} data-reveal style={{ ["--d" as string]: `${i * 100}ms` }}>
                <Link href={href(locale, c.path)} className="tarjeta eleva group flex h-full flex-col p-6 hover:border-mar-300">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-mar-50 text-mar-600">
                    {c.icon === "calendar" ? <CalendarCheck2 className="h-5 w-5" aria-hidden /> : <Ticket className="h-5 w-5" aria-hidden />}
                  </span>
                  <p className="mt-4 font-display text-lg font-bold group-hover:text-mar-700">{c.title}</p>
                  <p className="mt-1 text-sm text-tinta-suave">{c.text}</p>
                  <ArrowRight className="mt-4 h-4 w-4 text-mar-600 transition group-hover:translate-x-1" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          {SITE.contactEmail && (
            <p className="mt-12 flex flex-wrap items-center gap-2 text-sm text-tinta-suave">
              <Mail className="h-4 w-4 text-mar-600" aria-hidden />
              {t.contact}: <a href={`mailto:${SITE.contactEmail}`} className="enlace">{SITE.contactEmail}</a>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
