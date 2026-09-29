import { ArrowUpRight } from "lucide-react";
import { EDICIONES, type EdicionLink } from "@/content/site";
import { pick, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

/**
 * Eje cronológico de las ediciones de ieTIC.
 *
 *  · Escritorio (xl): eje horizontal PROPORCIONAL al tiempo (2011 → 2027), con
 *    los datos alternando arriba y abajo; se ven los huecos entre ediciones y
 *    la racha anual reciente. Al entrar en pantalla la línea se traza y los
 *    nodos aparecen en secuencia; el de esta edición late en dorado.
 *  · Tablet y móvil: el mismo eje en vertical.
 */
const FIRST = EDICIONES[0].year;
const LAST = EDICIONES[EDICIONES.length - 1].year;
const SPAN = LAST - FIRST;

export function EditionsTimeline({
  locale,
  labels,
  thisEdition,
}: {
  locale: Locale;
  labels: Record<EdicionLink["kind"], string>;
  thisEdition: string;
}) {
  return (
    <>
      {/* ─── Horizontal (xl) ─────────────────────────────────────────── */}
      <div data-reveal className="eje relative mt-16 hidden h-[27rem] xl:block">
        {/* línea del eje: se traza de izquierda a derecha */}
        <span
          className="eje__linea absolute left-[4%] right-[4%] top-1/2 h-px bg-gradient-to-r from-cian-300/15 via-cian-300/45 to-oro-400"
          aria-hidden
        />
        {/* marcas de cada año (también los que no tuvieron edición) */}
        {Array.from({ length: SPAN + 1 }).map((_, i) => (
          <span
            key={i}
            className="absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-white/20"
            style={{ left: `calc(6% + ${i / SPAN} * 88%)` }}
            aria-hidden
          />
        ))}
        <ol>
          {EDICIONES.map((e, i) => {
            const above = i % 2 === 0;
            return (
              <li key={e.year} className="absolute top-0 h-full w-0" style={{ left: `calc(6% + ${(e.year - FIRST) / SPAN} * 88%)` }}>
                {/* nodo */}
                <span
                  className={cn(
                    "eje__nodo absolute left-0 top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
                    e.current
                      ? "bg-oro-400 shadow-[0_0_20px_rgba(235,174,63,0.8)]"
                      : "border border-cian-300/60 bg-noche-800",
                  )}
                  style={{ ["--d" as string]: `${300 + i * 70}ms` }}
                  aria-hidden
                >
                  {e.current ? (
                    <span className="absolute inset-0 animate-ping rounded-full bg-oro-400/60" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-cian-300" />
                  )}
                </span>
                {/* tallo */}
                <span
                  className={cn(
                    "eje__texto absolute left-0 w-px",
                    above ? "bottom-[calc(50%+0.75rem)] h-8" : "top-[calc(50%+0.75rem)] h-8",
                    e.current ? "bg-oro-400/60" : "bg-white/15",
                  )}
                  style={{ ["--d" as string]: `${360 + i * 70}ms` }}
                  aria-hidden
                />
                {/* datos */}
                <div
                  className={cn(
                    "eje__texto absolute left-0 flex w-[7.5rem] -translate-x-1/2 flex-col items-center text-center",
                    above ? "bottom-[calc(50%+2.75rem)] flex-col-reverse" : "top-[calc(50%+2.75rem)]",
                  )}
                  style={{ ["--d" as string]: `${380 + i * 70}ms` }}
                >
                  <p className={cn("font-display text-2xl font-bold leading-none", e.current ? "text-oro-300" : "text-white")}>
                    {e.year}
                  </p>
                  {/* en espejo: del año hacia fuera (arriba se invierte el orden) */}
                  <div className={cn("flex items-center", above ? "mb-1.5 flex-col-reverse" : "mt-1.5 flex-col")}>
                    <p className={cn("font-serif text-[1.05rem] italic leading-tight", e.current ? "text-oro-200" : "text-cian-200/85")}>
                      {e.edition}
                      {e.current && <span className="block">{thisEdition}</span>}
                    </p>
                    {e.place && <p className="my-0.5 text-sm font-medium leading-tight text-white/90">{pick(e.place, locale)}</p>}
                    {e.note && <p className="my-0.5 text-[0.7rem] leading-snug text-white/55">{pick(e.note, locale)}</p>}
                    <Links links={e.links} year={e.year} labels={labels} className="my-1 justify-center" />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ─── Vertical (tablet y móvil) ───────────────────────────────── */}
      <ol className="relative mt-12 ml-2 border-l border-cian-300/25 xl:hidden">
        {EDICIONES.map((e, i) => (
          <li key={e.year} data-reveal style={{ ["--d" as string]: `${i * 50}ms` }} className="relative pb-7 pl-7 last:pb-0">
            <span
              className={cn(
                "absolute -left-[0.55rem] top-1.5 flex h-4 w-4 items-center justify-center rounded-full",
                e.current ? "bg-oro-400 shadow-[0_0_18px_rgba(235,174,63,0.8)]" : "border border-cian-300/60 bg-noche-800",
              )}
              aria-hidden
            >
              {e.current ? (
                <span className="absolute inset-0 animate-ping rounded-full bg-oro-400/60" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-cian-300" />
              )}
            </span>
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className={cn("font-display text-2xl font-bold", e.current ? "text-oro-300" : "text-white")}>{e.year}</span>
              <span className={cn("font-serif text-lg italic", e.current ? "text-oro-200" : "text-cian-200/85")}>
                {e.edition}
                {e.current && `, ${thisEdition}`}
              </span>
            </p>
            {(e.place || e.note) && (
              <p className="mt-0.5 text-sm text-white/80">
                {e.place && <span className="font-medium text-white/90">{pick(e.place, locale)}</span>}
                {e.place && e.note && ", "}
                {e.note && <span className="text-white/60">{pick(e.note, locale)}</span>}
              </p>
            )}
            <Links links={e.links} year={e.year} labels={labels} className="mt-2" />
          </li>
        ))}
      </ol>
    </>
  );
}

function Links({
  links,
  year,
  labels,
  className,
}: {
  links?: EdicionLink[];
  year: number;
  labels: Record<EdicionLink["kind"], string>;
  className?: string;
}) {
  if (!links?.length) return null;
  return (
    <p className={cn("flex flex-wrap gap-x-3 gap-y-1", className)}>
      {links.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[0.75rem] font-medium text-cian-200 underline decoration-cian-300/35 underline-offset-[3px] transition hover:text-white hover:decoration-white"
          aria-label={`${labels[l.kind]} ieTIC ${year}`}
        >
          {labels[l.kind]}
          <ArrowUpRight className="h-3 w-3" aria-hidden />
        </a>
      ))}
    </p>
  );
}
