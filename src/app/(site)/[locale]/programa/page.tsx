import type { Metadata } from "next";
import { ProgrammeApp } from "@/components/programme/programme-app";
import { ProgrammeStatus } from "@/components/programme/programme-status";
import { PageHeader } from "@/components/ui/page-header";
import { sectionColor } from "@/content/ui";
import { PageArt } from "@/components/ui/page-art";
import { SITE } from "@/content/site";
import { isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { ProgrammeData } from "@/lib/programme";
import { loadProgramme } from "@/lib/programme-data";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    title: "Programa",
    lead: "Dos jornadas de ponencias, panel de expertos, talleres, mesa redonda y paneles de comunicaciones, en Salamanca y en línea. Marca con la estrella las sesiones que no te quieres perder y consulta cada una por sala y hora.",
    provisional: "Programa provisional",
    provisionalNote: "sujeto a cambios",
    definitive: "Programa definitivo",
    error: "El programa no está disponible en este momento. Vuelve a intentarlo en unos minutos.",
  },
  pt: {
    title: "Programa",
    lead: "Dois dias de conferências, painel de especialistas, oficinas, mesa-redonda e painéis de comunicações, em Salamanca e online. Marca com a estrela as sessões que não queres perder e consulta cada uma por sala e hora.",
    provisional: "Programa provisório",
    provisionalNote: "sujeito a alterações",
    definitive: "Programa definitivo",
    error: "O programa não está disponível neste momento. Tenta novamente dentro de alguns minutos.",
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return pageMetadata(locale, "/programa", T[locale].title, T[locale].lead);
}

export default async function ProgrammePage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const t = T[locale];

  const data = await loadProgramme("programa");

  return (
    <>
      <PageHeader eyebrow={pick(SITE.datesLabel, locale)} title={t.title} lead={t.lead} art={<PageArt />} color={sectionColor("/programa")}>
        {data && (
          <ProgrammeStatus data={data} locale={locale} provisional={t.provisional} definitive={t.definitive} note={t.provisionalNote} />
        )}
      </PageHeader>

      <section className="bg-papel pb-20 pt-8 sm:pb-24">
        <div className="contenedor">
          {data ? (
            <ProgrammeApp data={data} locale={locale} />
          ) : (
            <p className="rounded-lg border border-dashed border-linea bg-white p-10 text-center text-tinta-suave">{t.error}</p>
          )}
        </div>
      </section>
    </>
  );
}
