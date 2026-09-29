import { Clock3 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Aviso de contenido pendiente («Próximamente»): nota al margen con filete
 * dorado. Deja claro que la información llegará, sin inventarla.
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
        "flex gap-4 rounded-r-md border-l-2 border-oro-400 py-4 pl-5 pr-5 sm:pr-6",
        dark ? "bg-white/[0.04] text-white/75" : "bg-oro-50/70 text-tinta-suave",
        className,
      )}
    >
      <Clock3 className={cn("mt-0.5 h-5 w-5 shrink-0", dark ? "text-oro-300" : "text-oro-600")} aria-hidden />
      <div>
        <p className={cn("font-display font-semibold", dark ? "text-white" : "text-tinta")}>{title}</p>
        {children && <div className="mt-1 text-sm leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
