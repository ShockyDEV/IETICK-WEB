import type { Metadata } from "next";
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
    lead: "Organiza ieTIC 2027 el consorcio de la red de universidades hispano-lusa formada por el Instituto Politécnico de Bragança, la Universidad de Salamanca, la Universidade Aberta y la UNED, con la colaboración de la Asociación de Atención Temprana AMPA.",
    organizing: "Comité organizador",
    scientific: "Comité científico",
    pending: "La composición del comité se publicará próximamente.",
  },
  pt: {
    eyebrow: "Comissões",
    title: "Quem faz o ieTIC 2027",
    lead: "O ieTIC 2027 é organizado pelo consórcio da rede de universidades luso-espanhola formada pelo Instituto Politécnico de Bragança, pela Universidade de Salamanca, pela Universidade Aberta e pela UNED, com a colaboração da Asociación de Atención Temprana AMPA.",
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
      </section>
    </>
  );
}
