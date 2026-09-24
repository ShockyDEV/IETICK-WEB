import { cn } from "@/lib/cn";
import { BrandText } from "./brand-text";

/**
 * Cabecera oscura de las páginas interiores: antetítulo, titular y
 * entradilla, con la franja del skyline de Salamanca al pie.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  art,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  /** Ilustración inferior (franja del skyline) */
  art?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-noche-900 text-white", className)}>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_110%,rgba(22,116,146,0.55),transparent_60%),radial-gradient(ellipse_at_10%_-10%,rgba(152,221,237,0.10),transparent_55%)]"
        aria-hidden
      />
      <div className={cn("contenedor relative z-10 pt-14 sm:pt-20", art ? "pb-6" : "pb-16 sm:pb-20")}>
        <p className="antetitulo-claro">
          <BrandText>{eyebrow}</BrandText>
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl">{title}</h1>
        {lead && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">{lead}</p>}
        {children}
      </div>
      {art && <div className="relative">{art}</div>}
    </section>
  );
}
