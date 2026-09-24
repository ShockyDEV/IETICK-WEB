/**
 * Franja compacta del skyline de Salamanca (puente, catedrales, Clerecía y
 * río) para las cabeceras de las páginas interiores. Misma geometría que el
 * héroe, sin constelación y sin animación.
 *
 * - Alto por defecto: 176 px (`h-44`); se cambia con `className`, p. ej. `h-36`
 *   o `h-40`. Ancho: 100 %.
 * - La parte superior es transparente: se funde con el fondo oscuro de la
 *   cabecera (p. ej. `bg-noche-900`). Abajo termina en el río.
 * - Encaje: el conjunto monumental queda al 72 % del ancho desde 768 px (con
 *   la parte izquierda atenuada, donde suele ir el título) y centrado en
 *   móvil; a los lados el caserío continúa en espejo.
 */
import { cn } from "@/lib/cn";
import { CiudadSvg } from "./CiudadSvg";
import { CIUDAD } from "./skyline-paths";

export type SkylineStripProps = {
  className?: string;
};

/** Recorte vertical del arte: sin cielo sobrante y con una lámina de río fina. */
const RECORTE = [18, 618] as const;
const PROPORCION = ((CIUDAD.ancho * 5) / RECORTE[1]).toFixed(3);
const ANCLA = ((CIUDAD.foco + CIUDAD.ancho * 2) / RECORTE[1]).toFixed(3);

const CSS = `
.ietic-s-marco{position:absolute;inset:0}
.ietic-s svg{position:absolute;display:block;overflow:hidden;bottom:0;height:100%;width:calc(100cqh*${PROPORCION});left:min(0px,calc(50cqw - 100cqh*${ANCLA}))}
@media (min-width:768px){
.ietic-s svg{left:min(0px,calc(72cqw - 100cqh*${ANCLA}))}
.ietic-s-marco{-webkit-mask-image:linear-gradient(90deg,rgba(0,0,0,.3),#000 45%);mask-image:linear-gradient(90deg,rgba(0,0,0,.3),#000 45%)}
}
`;

export function SkylineStrip({ className }: SkylineStripProps) {
  return (
    <div
      className={cn("ietic-s pointer-events-none relative h-44 w-full select-none overflow-hidden", className)}
      style={{ containerType: "size" }}
      aria-hidden
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ietic-s-marco">
        <CiudadSvg pre="ietic-s" recorte={RECORTE} teselas={2} />
      </div>
    </div>
  );
}

export default SkylineStrip;
