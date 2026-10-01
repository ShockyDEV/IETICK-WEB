import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";
import { ProgrammeApp } from "@/components/programme/programme-app";
import { PageHeader } from "@/components/ui/page-header";
import { sectionColor } from "@/content/ui";
import { PageArt } from "@/components/ui/page-art";
import { SITE } from "@/content/site";
import { isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getProgramme, type ProgrammeData } from "@/lib/programme";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    title: "Programa",
    lead: "Dos jornadas de ponencias, panel de expertos, talleres, mesa redonda y paneles de comunicaciones, en Salamanca y en línea. Marca con la estrella las sesiones que no te quieres perder y consulta cada una por sala y hora.",
    provisional: "Programa provisional",
    provisionalNote: "sujeto a cambios",
    definitive: "Programa definitivo",
    updated: "Actualizado el",
    error: "El programa no está disponible en este momento. Vuelve a intentarlo en unos minutos.",
  },
  pt: {
    title: "Programa",
    lead: "Dois dias de conferências, painel de especialistas, oficinas, mesa-redonda e painéis de comunicações, em Salamanca e online. Marca com a estrela as sessões que não queres perder e consulta cada uma por sala e hora.",
    provisional: "Programa provisório",
    provisionalNote: "sujeito a alterações",
    definitive: "Programa definitivo",
    updated: "Atualizado em",
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

  let data: ProgrammeData | null = null;
  try {
    data = await getProgramme();
  } catch (e) {
    console.error("[programa] no se pudo leer la base de datos:", e);
  }

  const updated = data?.updatedAt
    ? new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Madrid",
      }).format(new Date(data.updatedAt))
    : null;

  return (
    <>
      <PageHeader eyebrow={pick(SITE.datesLabel, locale)} title={t.title} lead={t.lead} art={<PageArt />} color={sectionColor("/programa")}>
        {data && (
          <div className={`mt-7 border-l-2 pl-4 ${data.status === "provisional" ? "border-oro-400" : "border-cian-300"}`}>
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className={`font-display font-semibold ${data.status === "provisional" ? "text-oro-200" : "text-cian-200"}`}>
                {data.status === "provisional" ? t.provisional : t.definitive}
              </span>
              {data.status === "provisional" && <span className="nota text-white/70">{t.provisionalNote}</span>}
            </p>
            {updated && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/60">
                <CalendarClock className="h-4 w-4" aria-hidden />
                {t.updated} {updated}
              </p>
            )}
          </div>
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
