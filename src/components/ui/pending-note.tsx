import { Clock3 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Aviso de contenido pendiente («Próximamente»): tarjeta con borde
 * discontinuo. Deja claro que la información llegará, sin inventarla.
 */
export function PendingNote({
  title,
  children,
  className,
  dark = false,
}: {
  title: string;
  children?: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-4 rounded-2xl border border-dashed p-5 sm:p-6",
        dark ? "border-cian-300/35 bg-white/[0.03] text-white/75" : "border-mar-300 bg-mar-50/60 text-tinta-suave",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          dark ? "bg-cian-300/10 text-cian-300" : "bg-white text-mar-600 shadow-tarjeta",
        )}
      >
        <Clock3 className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p className={cn("font-display font-semibold", dark ? "text-white" : "text-tinta")}>{title}</p>
        {children && <div className="mt-1 text-sm leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
