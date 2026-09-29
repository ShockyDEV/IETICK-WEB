import { cn } from "@/lib/cn";

/**
 * «Punto y estela»: la firma animada de ieTIC 2027. El punto del logo (el de
 * dentro de la «C») sale disparado y deja tras de sí una línea recta que
 * crece de izquierda a derecha; al final se queda brillando.
 *
 *   mode="hover"  bajo las entradas del menú: aparece al pasar por un
 *                 antecesor `.trazo-hover` (o con foco) y queda fija si el
 *                 antecesor tiene la clase `is-active`
 *   mode="draw"   se traza cuando un antecesor `[data-reveal]` entra en pantalla
 *   mode="intro"  se traza al cargar la página (cabeceras)
 *
 * Componente de servidor: solo marcado + clases de globals.css.
 */
export function TraceLine({
  width,
  color = "currentColor",
  mode = "draw",
  delay = 0,
  thickness = 2,
  className,
}: {
  width: number;
  color?: string;
  mode?: "hover" | "draw" | "intro";
  delay?: number;
  thickness?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("trazo", `trazo--${mode}`, className)}
      style={{
        ["--w" as string]: `${width}px`,
        ["--c" as string]: color,
        ["--d" as string]: `${delay}ms`,
        ["--g" as string]: `${thickness}px`,
      }}
      aria-hidden
    >
      <span className="trazo__linea" />
      <span className="trazo__punto" />
    </span>
  );
}
