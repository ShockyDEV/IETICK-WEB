import type { Metadata } from "next";
import { CalendarClock, TriangleAlert } from "lucide-react";
import { ProgrammeApp } from "@/components/programme/programme-app";
import { PageHeader } from "@/components/ui/page-header";
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
    lead: "Dos jornadas de ponencias invitadas, panel de expertos, mesa redonda, talleres y paneles de comunicaciones en el IUCE. Marca con la estrella las sesiones que no te quieres perder y consulta cada una por sala y hora.",
    provisional: "Programa provisional · sujeto a cambios",
    definitive: "Programa definitivo",
    updated: "Actualizado el",
    error: "El programa no está disponible en este momento. Vuelve a intentarlo en unos minutos.",
  },
  pt: {
    title: "Programa",
    lead: "Dois dias de conferências convidadas, painel de especialistas, mesa-redonda, oficinas e painéis de comunicações no IUCE. Marca com a estrela as sessões que não queres perder e consulta cada uma por sala e hora.",
    provisional: "Programa provisório · sujeito a alterações",
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
      <PageHeader eyebrow={`ieTIC 2027 · ${pick(SITE.datesShort, locale)}`} title={t.title} lead={t.lead} art={<PageArt />}>
        {data && (
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span
              className={
                data.status === "provisional"
                  ? "inline-flex items-center gap-2 rounded-full border border-oro-400/60 bg-oro-400/10 px-3 py-1 font-medium text-oro-200"
                  : "inline-flex items-center gap-2 rounded-full border border-cian-300/50 bg-cian-300/10 px-3 py-1 font-medium text-cian-200"
              }
            >
              {data.status === "provisional" && <TriangleAlert className="h-4 w-4" aria-hidden />}
              {data.status === "provisional" ? t.provisional : t.definitive}
            </span>
            {updated && (
              <span className="inline-flex items-center gap-1.5 text-white/60">
                <CalendarClock className="h-4 w-4" aria-hidden />
                {t.updated} {updated}
              </span>
            )}
          </div>
        )}
      </PageHeader>

      <section className="bg-papel pb-20 pt-8 sm:pb-24">
        <div className="contenedor">
          {data ? (
            <ProgrammeApp data={data} locale={locale} />
          ) : (
            <p className="rounded-2xl border border-dashed border-linea bg-white p-10 text-center text-tinta-suave">{t.error}</p>
          )}
        </div>
      </section>
    </>
  );
}
