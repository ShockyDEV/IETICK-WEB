/**
 * Patrón low-poly sutil (eco del fondo poligonal del logo de ieTIC 2027) para
 * bandas oscuras. Se coloca dentro de un contenedor `relative` con fondo
 * oscuro (p. ej. `bg-noche-900` o `bg-noche-800`):
 *
 *   <section className="relative overflow-hidden bg-noche-900">
 *     <FacetPattern />
 *     <div className="relative">…</div>
 *   </section>
 *
 * Estático, sin hooks (Server Component). `seed` cambia la disposición de las
 * facetas (y hace únicos los id si hay varias bandas en la misma página).
 */
import { cn } from "@/lib/cn";
import { mallaLowPoly } from "./sky-paths";

export type FacetPatternProps = {
  className?: string;
  /** Semilla de la malla (entero). Por defecto, 7. */
  seed?: number;
};

const ANCHO = 1920;
const ALTO = 1080;

export function FacetPattern({ className, seed = 7 }: FacetPatternProps) {
  const capas = mallaLowPoly({
    semilla: seed,
    ancho: ANCHO,
    alto: ALTO,
    nx: 9,
    ny: 5,
    jitter: 0.34,
    alfa: (x, y) => (0.45 + 0.55 * (x / ANCHO)) * (1 - 0.35 * (y / ALTO)),
    colores: ["#1C86A7", "#98DDED"],
    niveles: [0.02, 0.038, 0.06],
  });
  const luz = `ietic-f${seed}-luz`;
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full select-none", className)}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
      aria-hidden
    >
      <defs>
        <radialGradient id={luz} gradientUnits="userSpaceOnUse" cx="1560" cy="120" r="1150">
          <stop offset="0" stopColor="#167492" stopOpacity=".2" />
          <stop offset="1" stopColor="#167492" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={ANCHO} height={ALTO} fill={`url(#${luz})`} />
      <g stroke="#98DDED" strokeOpacity=".05" strokeWidth="1" strokeLinejoin="round">
        {capas.map((c, i) => (
          <path key={i} d={c.d} fill={c.color} fillOpacity={c.o} />
        ))}
      </g>
    </svg>
  );
}

export default FacetPattern;
