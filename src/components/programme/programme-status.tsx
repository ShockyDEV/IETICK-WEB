import { CalendarClock } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { ProgrammeData } from "@/lib/programme";

/**
 * Aviso de estado para la cabecera de Programa y Ponentes: provisional (sujeto a
 * cambios) o definitivo, con la fecha de la última actualización del programa.
 */
export function ProgrammeStatus({
  data,
  locale,
  provisional,
  definitive,
  note,
}: {
  data: ProgrammeData;
  locale: Locale;
  provisional: string;
  definitive: string;
  note: string;
}) {
  const isProvisional = data.status === "provisional";
  const updated = data.updatedAt
    ? new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Madrid",
      }).format(new Date(data.updatedAt))
    : null;

  return (
    <div className={`mt-7 border-l-2 pl-4 ${isProvisional ? "border-oro-400" : "border-cian-300"}`}>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className={`font-display font-semibold ${isProvisional ? "text-oro-200" : "text-cian-200"}`}>
          {isProvisional ? provisional : definitive}
        </span>
        {isProvisional && <span className="nota text-white/70">{note}</span>}
      </p>
      {updated && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-white/60">
          <CalendarClock className="h-4 w-4" aria-hidden />
          {locale === "pt" ? "Atualizado em" : "Actualizado el"} {updated}
        </p>
      )}
    </div>
  );
}
