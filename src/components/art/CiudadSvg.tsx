/**
 * Capa SVG de la ciudad (monumentos, caserío, puente y río), compartida por
 * HeroArt y SkylineStrip. Componente interno: sin hooks, apto para Server
 * Components. Las animaciones solo se activan si un antepasado lleva la clase
 * `ietic-anim` (la define HeroArt junto con sus @keyframes).
 */
import { CASERIO, CIUDAD, ESTELAS, MONUMENTOS, PAQUETES, PUENTE_D, REFLEJOS, type Capas } from "./skyline-paths";

type Props = {
  /** Prefijo de los id del SVG (único por componente en la página). */
  pre: string;
  className?: string;
  /** Recorte vertical del arte: [y inicial, alto]. */
  recorte?: readonly [number, number];
  /** Teselas espejo a cada lado del arte (para anchos extremos). */
  teselas?: 1 | 2;
  /** Incluye los elementos que solo tienen sentido animados (paquetes de datos). */
  animado?: boolean;
};

const W = CIUDAD.ancho;
const H = CIUDAD.alto;
const AGUA = CIUDAD.agua;

const CARAS = ["media", "luz", "sombra"] as const;
const GRUPOS = ["lejos", "fondo", "medio", "frente"] as const;
type NombreGrupo = (typeof GRUPOS)[number];

/** Define en <defs> las caras de un grupo (sin relleno) para reutilizarlas con <use>. */
function CarasDef({ c, id }: { c: Capas; id: (s: string) => string }) {
  return (
    <>
      {CARAS.map((cara) => (c[cara] ? <path key={cara} id={id(cara)} d={c[cara]} /> : null))}
    </>
  );
}

/** Pinta un grupo de monumentos: caras con sus degradados de luz y detalles encima. */
function Grupo({ c, id, url, opacity }: { c: Capas; id: (s: string) => string; url: (s: string) => string; opacity?: number }) {
  return (
    <g opacity={opacity}>
      {CARAS.map((cara) => (c[cara] ? <use key={cara} href={`#${id(cara)}`} fill={url(cara)} /> : null))}
      {c.hueco && <path d={c.hueco} fill="#06222F" fillOpacity=".9" />}
      {c.trazo && <path d={c.trazo} fill="none" stroke="#5A3C0E" strokeOpacity=".5" strokeWidth="1" />}
      {c.brillo && <path d={c.brillo} fill="none" stroke="#FDF7EA" strokeOpacity=".7" strokeWidth="1" />}
      {c.remate && <path d={c.remate} fill="none" stroke="#F5D68F" strokeWidth="1.4" strokeLinecap="round" />}
    </g>
  );
}

/** Arte principal + copias en espejo (y copias directas más allá si `teselas` = 2). */
function Teselas({ href, teselas }: { href: string; teselas: 1 | 2 }) {
  return (
    <>
      <use href={href} />
      <use href={href} transform="matrix(-1 0 0 1 0 0)" />
      <use href={href} transform={`matrix(-1 0 0 1 ${2 * W} 0)`} />
      {teselas === 2 && (
        <>
          <use href={href} transform={`translate(${-2 * W} 0)`} />
          <use href={href} transform={`translate(${2 * W} 0)`} />
        </>
      )}
    </>
  );
}

export function CiudadSvg({ pre, className, recorte = [0, H], teselas = 1, animado = false }: Props) {
  const id = (s: string) => `${pre}-${s}`;
  const url = (s: string) => `url(#${pre}-${s})`;
  const x0 = -W * teselas;
  const ancho = W * (1 + 2 * teselas);
  const { trasera, delantera, ribera } = CASERIO;

  return (
    <svg
      className={className}
      viewBox={`${x0} ${recorte[0]} ${ancho} ${recorte[1]}`}
      preserveAspectRatio="xMidYMax slice"
      focusable="false"
      aria-hidden
    >
      <defs>
        {/* Piedra de Villamayor iluminada: crema arriba, ámbar en medio, fundida con la noche en la base */}
        <linearGradient id={id("luz")} gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="480">
          <stop offset="0" stopColor="#FBE9BC" />
          <stop offset=".2" stopColor="#F5D68F" />
          <stop offset=".4" stopColor="#F0C263" />
          <stop offset=".56" stopColor="#EBAE3F" />
          <stop offset=".68" stopColor="#D08E22" />
          <stop offset=".8" stopColor="#8A5C14" />
          <stop offset=".9" stopColor="#2E3A33" />
          <stop offset="1" stopColor="#0A2F40" />
        </linearGradient>
        <linearGradient id={id("media")} gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="480">
          <stop offset="0" stopColor="#F3CB76" />
          <stop offset=".4" stopColor="#DDA033" />
          <stop offset=".6" stopColor="#BF8019" />
          <stop offset=".75" stopColor="#8F5E12" />
          <stop offset=".88" stopColor="#3A3A2A" />
          <stop offset="1" stopColor="#0A2F40" />
        </linearGradient>
        <linearGradient id={id("sombra")} gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="480">
          <stop offset="0" stopColor="#CF9128" />
          <stop offset=".4" stopColor="#A8701A" />
          <stop offset=".64" stopColor="#7A5212" />
          <stop offset=".8" stopColor="#453414" />
          <stop offset="1" stopColor="#0A2F40" />
        </linearGradient>
        {/* Halo cálido que la ciudad iluminada proyecta en el cielo */}
        <radialGradient
          id={id("halo")}
          gradientUnits="userSpaceOnUse"
          cx="2010"
          cy="330"
          r="640"
          gradientTransform="matrix(1 0 0 .46 0 178)"
        >
          <stop offset="0" stopColor="#EBAE3F" stopOpacity=".26" />
          <stop offset=".45" stopColor="#DA9724" stopOpacity=".09" />
          <stop offset="1" stopColor="#DA9724" stopOpacity="0" />
        </radialGradient>
        {/* Luz de borde en los tejados cercanos a los monumentos */}
        <radialGradient
          id={id("borde")}
          gradientUnits="userSpaceOnUse"
          cx="2010"
          cy="430"
          r="620"
          gradientTransform="matrix(1 0 0 .35 0 280)"
        >
          <stop offset="0" stopColor="#F0C263" stopOpacity=".7" />
          <stop offset=".55" stopColor="#DA9724" stopOpacity=".2" />
          <stop offset="1" stopColor="#DA9724" stopOpacity="0" />
        </radialGradient>
        {/* Resplandor azul petróleo del horizonte urbano */}
        <linearGradient id={id("horizonte")} gradientUnits="userSpaceOnUse" x1="0" y1="140" x2="0" y2={AGUA}>
          <stop offset="0" stopColor="#134B63" stopOpacity="0" />
          <stop offset=".6" stopColor="#134B63" stopOpacity=".32" />
          <stop offset="1" stopColor="#167492" stopOpacity=".42" />
        </linearGradient>
        <linearGradient id={id("agua")} gradientUnits="userSpaceOnUse" x1="0" y1={AGUA} x2="0" y2={H}>
          <stop offset="0" stopColor="#0E3D52" />
          <stop offset=".3" stopColor="#0A2F40" />
          <stop offset=".7" stopColor="#06222F" />
          <stop offset="1" stopColor="#031822" />
        </linearGradient>
        <linearGradient id={id("piedra")} gradientUnits="userSpaceOnUse" x1="0" y1="504" x2="0" y2={AGUA}>
          <stop offset="0" stopColor="#8F5E12" />
          <stop offset=".2" stopColor="#5A4013" />
          <stop offset=".6" stopColor="#33291A" />
          <stop offset="1" stopColor="#16242A" />
        </linearGradient>
        {/* Los focos del puente: más luz frente al conjunto monumental */}
        <linearGradient id={id("foco")} gradientUnits="userSpaceOnUse" x1="300" y1="0" x2="3000" y2="0">
          <stop offset="0" stopColor="#EBAE3F" stopOpacity="0" />
          <stop offset=".45" stopColor="#EBAE3F" stopOpacity=".22" />
          <stop offset=".62" stopColor="#F0C263" stopOpacity=".3" />
          <stop offset=".8" stopColor="#EBAE3F" stopOpacity=".12" />
          <stop offset="1" stopColor="#EBAE3F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("ojo")} gradientUnits="userSpaceOnUse" x1="0" y1="522" x2="0" y2={AGUA}>
          <stop offset="0" stopColor="#F0C263" stopOpacity=".6" />
          <stop offset=".2" stopColor="#8F5E12" stopOpacity=".55" />
          <stop offset=".5" stopColor="#141C18" stopOpacity=".92" />
          <stop offset="1" stopColor="#031822" />
        </linearGradient>
        <linearGradient id={id("eo")} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#F0C263" stopOpacity="0" />
          <stop offset=".5" stopColor="#F5D68F" />
          <stop offset="1" stopColor="#F0C263" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("ec")} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#6FCDE4" stopOpacity="0" />
          <stop offset=".5" stopColor="#98DDED" />
          <stop offset="1" stopColor="#6FCDE4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("cometa")} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#DAF5FE" />
          <stop offset=".12" stopColor="#6FCDE4" stopOpacity=".9" />
          <stop offset="1" stopColor="#44BCD9" stopOpacity="0" />
        </linearGradient>
        {/* Rizos del agua para el reflejo del puente */}
        <pattern id={id("rizo")} width="150" height="9" patternUnits="userSpaceOnUse">
          <rect width="98" height="3.4" fill="#fff" />
          <rect x="108" width="30" height="3.4" fill="#fff" />
          <rect x="-10" y="4.6" width="36" height="2.8" fill="#fff" />
          <rect x="44" y="4.6" width="74" height="2.8" fill="#fff" />
          <rect x="126" y="4.6" width="40" height="2.8" fill="#fff" />
        </pattern>
        <mask id={id("rizos")} maskUnits="userSpaceOnUse" x={x0} y={AGUA} width={ancho} height={H - AGUA}>
          <rect x={x0} y={AGUA} width={ancho} height={H - AGUA} fill={url("rizo")} />
        </mask>
        {/* Caserío genérico (dos planos): se repite en espejo a los lados */}
        <g id={id("gen-a")}>
          <g fill="#0A2F40">
            <path id={id("trasera")} d={trasera.d} />
          </g>
          <g stroke="#F0C263" strokeWidth="3" strokeOpacity=".55">
            <path d={trasera.ventanas[0]} />
            <path d={trasera.ventanas[1]} stroke="#FAEBC8" />
            <path d={trasera.ventanas[2]} stroke="#98DDED" />
          </g>
        </g>
        <g id={id("gen-b")}>
          <path d={delantera.d} fill="#072634" />
          <g stroke="#F0C263" strokeWidth="3" strokeOpacity=".85">
            <path d={delantera.ventanas[0]} />
            <path d={delantera.ventanas[1]} stroke="#FAEBC8" />
            <path d={delantera.ventanas[2]} stroke="#98DDED" />
          </g>
          <path d={ribera} fill="#041C28" />
        </g>
        {/* Puente Romano */}
        <g id={id("puente")}>
          <path id={id("cuerpo")} d={PUENTE_D.cuerpo} fill={url("piedra")} />
          <use href={`#${id("cuerpo")}`} fill={url("foco")} />
          <path d={PUENTE_D.tajamares} fill="#B97A16" fillOpacity=".28" />
          <path d={PUENTE_D.huecos} fill={url("ojo")} />
          <path d={PUENTE_D.roscas} fill="none" stroke="#F5D68F" strokeOpacity=".7" strokeWidth="1.3" />
          <path d={PUENTE_D.imposta} stroke="#1C1A12" strokeOpacity=".6" strokeWidth="1.2" />
          <path d={PUENTE_D.pretil} stroke="#FAEBC8" strokeOpacity=".5" strokeWidth="1.2" />
        </g>
        {/* Caras de los monumentos (se reutilizan para el relleno y el resplandor) */}
        {GRUPOS.map((g) => (
          <CarasDef key={g} c={MONUMENTOS[g]} id={(cara) => id(`${g}-${cara}`)} />
        ))}
      </defs>

      {/* Cielo cercano: resplandor del horizonte y halo dorado */}
      <rect x={x0} y="140" width={ancho} height={AGUA - 140} fill={url("horizonte")} />
      <rect x={x0} y="0" width={ancho} height={AGUA} fill={url("halo")} />

      {/* Resplandor de la piedra iluminada (sin filtros: trazos anchos muy tenues) */}
      <g fill="none" stroke="#F0C263" strokeLinejoin="round">
        {([
          [18, 0.035],
          [8, 0.06],
        ] as const).map(([w, o]) =>
          (["fondo", "medio", "frente"] as const).flatMap((g) =>
            CARAS.filter((cara) => MONUMENTOS[g][cara]).map((cara) => (
              <use key={`${w}${g}${cara}`} href={`#${id(`${g}-${cara}`)}`} strokeWidth={w} strokeOpacity={o} />
            )),
          ),
        )}
      </g>

      {/* Monumentos, del más lejano al más cercano */}
      {GRUPOS.map((g: NombreGrupo) => (
        <Grupo
          key={g}
          c={MONUMENTOS[g]}
          id={(cara) => id(`${g}-${cara}`)}
          url={url}
          opacity={g === "lejos" ? 0.8 : undefined}
        />
      ))}

      {/* Caserío: arte principal + teselas espejo; la luz de borde solo junto a los monumentos */}
      <Teselas href={`#${id("gen-a")}`} teselas={teselas} />
      <use href={`#${id("trasera")}`} fill="none" stroke={url("borde")} strokeWidth="1.2" />
      <Teselas href={`#${id("gen-b")}`} teselas={teselas} />
      <path
        className="ietic-parpadeo"
        d={trasera.parpadeo + delantera.parpadeo}
        stroke="#FAEBC8"
        strokeWidth="3"
        strokeOpacity=".9"
      />

      {/* Río */}
      <rect x={x0} y={AGUA} width={ancho} height={H - AGUA} fill={url("agua")} />
      <g mask={url("rizos")} opacity=".42">
        <use href={`#${id("puente")}`} transform={`matrix(1 0 0 -1 0 ${2 * AGUA})`} />
      </g>
      <g className="ietic-vaiven" stroke="#F0C263" strokeLinecap="round">
        <path className="ietic-riel-0" d={REFLEJOS[0]} strokeWidth="2.4" strokeOpacity=".62" />
        <path className="ietic-riel-1" d={REFLEJOS[1]} strokeWidth="2" strokeOpacity=".42" />
        <path className="ietic-riel-2" d={REFLEJOS[2]} strokeWidth="1.6" strokeOpacity=".26" />
      </g>
      {[0, 1, 2].map((g) => (
        <g key={g} className={`ietic-deriva-${g}`}>
          {ESTELAS.filter((e) => e.g === g).map((e, i) => {
            const fill = url(e.tono === "oro" ? "eo" : "ec");
            return (
              <g key={i}>
                {e.h >= 2 && (
                  <rect x={e.x} y={Math.round((e.y - e.h * 1.6) * 10) / 10} width={e.w} height={Math.round(e.h * 42) / 10} fill={fill} opacity={Math.round(e.o * 20) / 100} />
                )}
                <rect x={e.x} y={e.y} width={e.w} height={e.h} fill={fill} opacity={e.o} />
              </g>
            );
          })}
        </g>
      ))}
      {animado &&
        PAQUETES.map((p, i) => (
          <rect
            key={i}
            className="ietic-viaje"
            x={p.x}
            y={p.y}
            width="150"
            height="1.8"
            rx=".9"
            fill={url("cometa")}
            style={{ animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
          />
        ))}

      {/* Puente delante de todo */}
      <use href={`#${id("puente")}`} />
    </svg>
  );
}
