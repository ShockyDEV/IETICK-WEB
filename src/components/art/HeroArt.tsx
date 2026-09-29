/**
 * Ilustración de fondo del héroe de portada: «Salamanca de noche, ciudad
 * dorada, en clave digital». Vista desde el Tormes con el Puente Romano, las
 * catedrales y la Clerecía iluminadas en dorado, y en el cielo una red de
 * nodos (ciencia abierta) sobre una malla low-poly muy sutil.
 *
 * - Server Component puro: sin hooks, sin "use client", sin dependencias.
 * - Tres capas: cielo a sangre (`slice`), ciudad anclada abajo y un velo de
 *   contraste para el texto. El encuadre de la ciudad se calcula con unidades
 *   de contenedor (cqw/cqh): en escritorio (≥ 1024 px) el conjunto monumental
 *   queda hacia el 72 % del ancho y deja calmado el 45 % izquierdo; en móvil
 *   se centra en la catedral y la ciudad ocupa el 40 % inferior.
 * - Animaciones solo con CSS, desactivadas con `animated={false}` o con
 *   `prefers-reduced-motion: reduce`.
 */
import { cn } from "@/lib/cn";
import { CiudadSvg } from "./CiudadSvg";
import { CIELO, CONSTELACION, ESTRELLAS, MALLA_CIELO, NODOS_D } from "./sky-paths";
import { CIUDAD } from "./skyline-paths";

export type HeroArtProps = {
  className?: string;
  /** Animaciones suaves (titileo, pulsos de datos, estelas). Por defecto, true. */
  animated?: boolean;
};

/* Encuadre: el SVG de la ciudad mide (arte + 2 teselas) de ancho. En móvil
   su alto no pasa de 38vh, que cabe en el hueco inferior del hero (42vh):
   así la cuenta atrás no pisa las torres. */
const PROPORCION = (CIUDAD.ancho * 3) / CIUDAD.alto;
/** Posición del foco monumental dentro del SVG, en múltiplos de su alto. */
const ANCLA = ((CIUDAD.foco + CIUDAD.ancho) / CIUDAD.alto).toFixed(3);

const CSS = `
.ietic-h svg{position:absolute;display:block;overflow:hidden}
.ietic-h-cielo{inset:0;width:100%;height:100%}
.ietic-h-ciudad{bottom:0;--h:min(40cqh,38vh);height:var(--h);width:calc(var(--h)*${PROPORCION});left:min(0px,calc(50cqw - var(--h)*${ANCLA}))}
.ietic-h-velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,24,34,.78) 0%,rgba(3,24,34,.5) 34%,rgba(3,24,34,0) 58%)}
@media (min-width:1024px){
.ietic-h-ciudad{--h:66cqh;left:min(0px,calc(72cqw - var(--h)*${ANCLA}))}
.ietic-h-velo{background:linear-gradient(90deg,rgba(3,24,34,.82) 0%,rgba(3,24,34,.62) 26%,rgba(3,24,34,.24) 46%,rgba(3,24,34,0) 60%),linear-gradient(180deg,rgba(3,24,34,.5) 0%,rgba(3,24,34,0) 22%)}
}
@keyframes ietic-tw{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes ietic-pulso{0%{stroke-dashoffset:10px}62%,100%{stroke-dashoffset:-100px}}
@keyframes ietic-deriva{from{transform:translateX(-40px)}to{transform:translateX(40px)}}
@keyframes ietic-riel{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes ietic-vaiven{0%,100%{transform:translateX(-3px)}50%{transform:translateX(3px)}}
@keyframes ietic-viaje{from{transform:translateX(0)}to{transform:translateX(-3400px)}}
@keyframes ietic-parpadeo{0%,44%,100%{opacity:1}46%,72%{opacity:.12}}
.ietic-anim .ietic-tw-a{animation:ietic-tw 5.5s ease-in-out infinite}
.ietic-anim .ietic-tw-b{animation:ietic-tw 7.5s ease-in-out -2.5s infinite}
.ietic-anim .ietic-tw-c{animation:ietic-tw 9s ease-in-out -5s infinite}
.ietic-anim .ietic-pulso{animation:ietic-pulso 9s linear infinite}
.ietic-anim .ietic-deriva-0{animation:ietic-deriva 21s ease-in-out infinite alternate}
.ietic-anim .ietic-deriva-1{animation:ietic-deriva 29s ease-in-out -9s infinite alternate-reverse}
.ietic-anim .ietic-deriva-2{animation:ietic-deriva 37s ease-in-out -17s infinite alternate}
.ietic-anim .ietic-riel-0{animation:ietic-riel 3.8s ease-in-out infinite}
.ietic-anim .ietic-riel-1{animation:ietic-riel 5.2s ease-in-out -1.7s infinite}
.ietic-anim .ietic-riel-2{animation:ietic-riel 6.6s ease-in-out -3.1s infinite}
.ietic-anim .ietic-vaiven{animation:ietic-vaiven 7s ease-in-out infinite}
.ietic-h .ietic-viaje{visibility:hidden}
.ietic-anim .ietic-viaje{visibility:visible;animation:ietic-viaje 30s linear infinite}
.ietic-anim .ietic-parpadeo{animation:ietic-parpadeo 16s steps(1,end) infinite}
@media (prefers-reduced-motion:reduce){.ietic-anim *{animation:none!important}.ietic-anim .ietic-viaje{visibility:hidden}}
`;

/** Pulsos de datos: duración y desfase de cada recorrido (s). */
const RITMO_PULSOS: [number, number][] = [
  [8, 0],
  [11, -3.5],
  [9.5, -6],
  [12.5, -1.5],
  [10, -8],
  [13, -4.5],
];

function Cielo() {
  const { nodos, lineas, pulsos } = CONSTELACION;
  return (
    <svg
      className="ietic-h-cielo"
      viewBox={`0 0 ${CIELO.ancho} ${CIELO.alto}`}
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
      aria-hidden
    >
      <defs>
        <linearGradient id="ietic-h-noche" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#031822" />
          <stop offset=".45" stopColor="#06222F" />
          <stop offset=".8" stopColor="#0A2F40" />
          <stop offset="1" stopColor="#0E3D52" />
        </linearGradient>
        <radialGradient id="ietic-h-nebulosa" gradientUnits="userSpaceOnUse" cx="1230" cy="200" r="620">
          <stop offset="0" stopColor="#167492" stopOpacity=".24" />
          <stop offset=".55" stopColor="#135E77" stopOpacity=".08" />
          <stop offset="1" stopColor="#135E77" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ietic-h-hub">
          <stop offset="0" stopColor="#98DDED" stopOpacity=".55" />
          <stop offset="1" stopColor="#98DDED" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={CIELO.ancho} height={CIELO.alto} fill="url(#ietic-h-noche)" />
      <rect width={CIELO.ancho} height={CIELO.alto} fill="url(#ietic-h-nebulosa)" />

      {/* Malla low-poly (eco del fondo del logo) */}
      <g>
        {MALLA_CIELO.map((c, i) => (
          <path key={i} d={c.d} fill={c.color} fillOpacity={c.o} />
        ))}
      </g>

      {/* Estrellas */}
      <g stroke="#DAF5FE" strokeLinecap="round" fill="none">
        <path d={ESTRELLAS[0]} strokeWidth="1.3" strokeOpacity=".4" />
        <path className="ietic-tw-a" d={ESTRELLAS[1]} strokeWidth="1.6" strokeOpacity=".65" />
        <path className="ietic-tw-b" d={ESTRELLAS[2]} strokeWidth="1.9" strokeOpacity=".7" />
        <path className="ietic-tw-c" d={ESTRELLAS[3]} strokeWidth="2.6" strokeOpacity=".85" />
      </g>

      {/* Red de conocimiento abierto */}
      <path d={lineas} fill="none" stroke="#98DDED" strokeOpacity=".15" strokeWidth=".9" />
      {pulsos.map((d, i) => {
        const [dur, delay] = RITMO_PULSOS[i % RITMO_PULSOS.length];
        const style = { animationDuration: `${dur}s`, animationDelay: `${delay}s` };
        return (
          <g key={i} fill="none" strokeLinecap="round">
            <path
              className="ietic-pulso"
              d={d}
              pathLength={100}
              stroke="#44BCD9"
              strokeOpacity=".35"
              strokeWidth="4"
              strokeDasharray="7 200"
              strokeDashoffset="10"
              style={style}
            />
            <path
              className="ietic-pulso"
              d={d}
              pathLength={100}
              stroke="#DAF5FE"
              strokeWidth="1.5"
              strokeDasharray="7 200"
              strokeDashoffset="10"
              style={style}
            />
          </g>
        );
      })}
      {nodos
        .filter((p) => p.hub)
        .map((p, i) => (
          <g key={i}>
            <circle cx={Math.round(p.x)} cy={Math.round(p.y)} r="12" fill="url(#ietic-h-hub)" />
            <circle cx={Math.round(p.x)} cy={Math.round(p.y)} r="6" fill="none" stroke="#98DDED" strokeOpacity=".4" strokeWidth=".8" />
          </g>
        ))}
      {(["ietic-tw-a", "ietic-tw-b", "ietic-tw-c"] as const).map((clase, g) => (
        <g key={clase} className={clase} fill="none" stroke="#DAF5FE" strokeLinecap="round">
          {NODOS_D[g][0] && <path d={NODOS_D[g][0]} strokeWidth="3" strokeOpacity=".9" />}
          {NODOS_D[g][1] && <path d={NODOS_D[g][1]} strokeWidth="4.6" />}
          {NODOS_D[g][2] && <path d={NODOS_D[g][2]} strokeWidth="2.4" strokeOpacity=".4" />}
        </g>
      ))}
    </svg>
  );
}

export function HeroArt({ className, animated = true }: HeroArtProps) {
  return (
    <div
      className={cn(
        "ietic-h pointer-events-none absolute inset-0 select-none overflow-hidden bg-noche-950",
        animated && "ietic-anim",
        className,
      )}
      style={{ containerType: "size" }}
      aria-hidden
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Cielo />
      <CiudadSvg pre="ietic-h" className="ietic-h-ciudad" animado={animated} />
      <div className="ietic-h-velo" />
    </div>
  );
}

export default HeroArt;
