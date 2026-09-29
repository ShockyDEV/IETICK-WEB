import { SITE } from "@/content/site";
import { pick, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

/**
 * La fecha «de cartel»: los días en grande y, al lado del filete, el mes en
 * cursiva y el lugar. Para fondos oscuros (portada y cabeceras).
 */
export function DateMark({ locale, place, className }: { locale: Locale; place?: string; className?: string }) {
  const first = SITE.days[0];
  const last = SITE.days[SITE.days.length - 1];
  const month = new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "es-ES", { month: "long", timeZone: "UTC" }).format(
    new Date(`${first}T12:00:00Z`),
  );
  const where = place ?? pick(SITE.venue.short, locale);

  return (
    <p className={cn("flex items-stretch gap-4", className)}>
      <span className="sr-only">
        {pick(SITE.datesLabel, locale)}, {where}
      </span>
      <span className="self-center whitespace-nowrap font-display text-[2.4rem] font-bold leading-none tracking-tight text-oro-300 sm:text-[2.75rem]" aria-hidden>
        {Number(first.slice(8))}
        <span className="mx-1 font-medium text-oro-300/55">–</span>
        {Number(last.slice(8))}
      </span>
      <span className="w-px shrink-0 bg-white/25" aria-hidden />
      <span className="flex flex-col justify-center gap-0.5" aria-hidden>
        <span className="font-serif text-[1.35rem] italic leading-none text-white">
          {month} de {SITE.year}
        </span>
        <span className="text-sm text-white/65">{where}</span>
      </span>
    </p>
  );
}
