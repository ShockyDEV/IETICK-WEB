import { cn } from "@/lib/cn";

/** Antetítulo numerado + titular + entradilla opcional. */
export function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
  dark = false,
  align = "left",
  className,
  id,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  dark?: boolean;
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-3xl", className)}>
      <p className={cn(dark ? "antetitulo-claro" : "antetitulo", "flex items-center gap-3", align === "center" && "justify-center")}>
        {index && <span className={cn("rounded-full border px-2 py-0.5", dark ? "border-cian-300/40" : "border-mar-200")}>{index}</span>}
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl",
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
