import type { Metadata } from "next";
import Image from "next/image";
import { PageArt } from "@/components/ui/page-art";
import { PageHeader } from "@/components/ui/page-header";
import { PendingNote } from "@/components/ui/pending-note";
import { sectionColor, UI } from "@/content/ui";
import { isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    eyebrow: "Comités",
    title: "Quién hace ieTIC 2027",
    lead: "ieTIC 2027 se organiza desde la Universidad de Salamanca, con el Instituto Universitario de Ciencias de la Educación (IUCE) como sede.",
    organizing: "Comité organizador",
    scientific: "Comité científico",
    pending: "La composición del comité se publicará próximamente.",
  },
  pt: {
    eyebrow: "Comissões",
    title: "Quem faz o ieTIC 2027",
    lead: "O ieTIC 2027 é organizado a partir da Universidade de Salamanca, com o Instituto Universitário de Ciências da Educação (IUCE) como local.",
    organizing: "Comissão organizadora",
    scientific: "Comissão científica",
    pending: "A composição da comissão será publicada brevemente.",
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return pageMetadata(locale, "/comites", T[locale].eyebrow, T[locale].lead);
}

export default async function ComitesPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const t = T[locale];

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead} art={<PageArt />} color={sectionColor("/comites")} />
      <section className="py-16 sm:py-20">
        <div className="contenedor grid gap-6 md:grid-cols-2">
          {[t.organizing, t.scientific].map((c, i) => (
            <div key={c} data-reveal style={{ ["--d" as string]: `${i * 100}ms` }} className="tarjeta p-7">
              <h2 className="font-display text-2xl font-bold">{c}</h2>
              <PendingNote title={pick(UI.soon, locale)} className="mt-6">
                {t.pending}
              </PendingNote>
            </div>
          ))}
        </div>
        <div className="contenedor mt-16">
          <p className="antetitulo">{pick(UI.organiza, locale)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-10">
            <Image src="/brand/usal-logo.png" alt="Universidad de Salamanca" width={854} height={232} className="h-14 w-auto" />
          </div>
        </div>
      </section>
    </>
  );
}
