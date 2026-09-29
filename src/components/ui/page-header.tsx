import { cn } from "@/lib/cn";
import { TraceLine } from "./trace-line";

/**
 * Cabecera oscura de las páginas interiores (la «SectionHero» de DIGIFOLK):
 * el «punto y estela» del color de la sección sale disparado y presenta el
 * antetítulo (en cursiva), el titular sube palabra a palabra y al pie va la
 * franja del skyline de Salamanca.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  art,
  color = "#98DDED",
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  /** Ilustración inferior (franja del skyline) */
  art?: React.ReactNode;
  /** Color de la sección (ver NAV en content/ui.ts) */
  color?: string;
  className?: string;
}) {
  const words = title.split(/\s+/).filter(Boolean);
  const afterTitle = 380 + words.length * 70;

  return (
    <section className={cn("relative isolate overflow-hidden bg-noche-900 text-white", className)} style={{ ["--seccion" as string]: color }}>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_110%,rgba(22,116,146,0.55),transparent_60%),radial-gradient(ellipse_at_10%_-10%,rgba(152,221,237,0.10),transparent_55%)]"
        aria-hidden
      />
      {/* halo del color de la sección, que entra barriendo */}
      <div
        className="barrido pointer-events-none absolute inset-0 -z-10 opacity-[0.16] [background:radial-gradient(ellipse_at_0%_0%,var(--seccion),transparent_55%)]"
        aria-hidden
      />
      <div className={cn("contenedor relative z-10 pt-14 sm:pt-20", art ? "pb-6" : "pb-16 sm:pb-20")}>
        <p className="antetitulo-claro flex items-baseline gap-3 !text-[color:var(--seccion)]">
          <TraceLine mode="intro" width={40} color={color} delay={60} thickness={2} className="shrink-0" />
          <span className="entra" style={{ animationDelay: "420ms" }}>
            {eyebrow}
          </span>
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl">
          {words.map((w, i) => (
            <span key={`${w}-${i}`}>
              <span className="palabra" style={{ animationDelay: `${360 + i * 70}ms` }}>
                {w}
              </span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        {lead && (
          <p className="entra mt-5 max-w-3xl text-lg leading-relaxed text-white/75" style={{ animationDelay: `${afterTitle}ms` }}>
            {lead}
          </p>
        )}
        {children && (
          <div className="entra" style={{ animationDelay: `${afterTitle + 80}ms` }}>
            {children}
          </div>
        )}
      </div>
      {art && <div className="relative">{art}</div>}
    </section>
  );
}
