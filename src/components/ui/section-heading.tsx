import { cn } from "@/lib/cn";
import { TraceLine } from "./trace-line";

/**
 * Antetítulo + titular + entradilla opcional. Aparece al entrar en pantalla:
 * el «punto y estela» dorado se traza y presenta el antetítulo (en cursiva).
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  dark = false,
  align = "left",
  className,
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  dark?: boolean;
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  return (
    <div data-reveal className={cn(align === "center" && "mx-auto text-center", "max-w-3xl", className)}>
      <p className={cn(dark ? "antetitulo-claro" : "antetitulo", "flex items-baseline gap-3", align === "center" && "justify-center")}>
        <TraceLine mode="draw" width={40} color={dark ? "#EBAE3F" : "#DA9724"} delay={200} className="shrink-0" />
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl",
          dark ? "text-white" : "text-tinta",
        )}
      >
        {title}
      </h2>
      {lead && (
        <p className={cn("mt-4 text-lg leading-relaxed", dark ? "text-white/70" : "text-tinta-suave")}>{lead}</p>
      )}
    </div>
  );
}
