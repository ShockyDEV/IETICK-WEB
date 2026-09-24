/**
 * Geometría compartida del skyline de Salamanca visto desde el Tormes
 * (la usan HeroArt y SkylineStrip).
 *
 * Sistema de coordenadas del «arte de la ciudad»: 3600 × 720 unidades, con la
 * línea de agua en y = 572. De izquierda a derecha, el conjunto monumental:
 * Torre de las Campanas (Catedral Nueva) · Torre del Gallo (Catedral Vieja) ·
 * cimborrio de la Catedral Nueva · Clerecía (torres gemelas + cúpula).
 * Delante, el Puente Romano (28 arcos de medio punto) y, abajo, el río.
 *
 * Las capas se agrupan por profundidad (fondo → medio → frente) y, dentro de
 * cada grupo, por tratamiento de luz, para que cada grupo se pinte con muy
 * pocos <path> (marcado ligero).
 */
import { apuntada, arco, bola, crearPrng, cupula, entre, n, ojiva, pinaculo, rect } from "./prng";

export const CIUDAD = {
  ancho: 3600,
  alto: 720,
  /** Línea de agua (base del puente). */
  agua: 572,
  /** Centro del conjunto monumental: ancla del encuadre responsive. */
  foco: 2012,
} as const;

export const PUENTE = {
  x0: 430,
  luz: 60,
  pila: 22,
  arcos: 28,
  tablero: 504,
  imposta: 512,
  arranque: 552,
} as const;

/** Entero → texto (el caserío no necesita decimales). */
const m = (v: number): string => String(Math.round(v));

/* ─── Monumentos ─────────────────────────────────────────────────────── */

/** Capas de un grupo de monumentos, de la más clara a los detalles. */
export type Capas = {
  /** Caras iluminadas de frente (piedra de Villamayor a plena luz). */
  luz: string;
  /** Caras oblicuas o más lejanas (media luz). */
  media: string;
  /** Caras en sombra. */
  sombra: string;
  /** Huecos: vanos de campanas, ventanas, arquerías. */
  hueco: string;
  /** Aristas de luz (cornisas). Trazo claro. */
  brillo: string;
  /** Detalles oscuros (nervios, impostas, balaustres). Trazo. */
  trazo: string;
  /** Cruces y varillas. Trazo dorado. */
  remate: string;
};

const nuevas = (): Capas => ({ luz: "", media: "", sombra: "", hueco: "", brillo: "", trazo: "", remate: "" });

/** Perfil de cúpula: [alto del 1.er punto de control, ancho del 2.º, alto del 2.º]. */
type Perfil = readonly [number, number, number];
const CUPULA: Perfil = [0.62, 0.56, 1];
const APUNTADA: Perfil = [0.52, 0.32, 0.8];

/** Meridiano de una cúpula (de la base al vértice), escalado en horizontal por f ∈ [−1, 1]. */
const meridiano = (cx: number, y: number, rx: number, h: number, [p1, p2, p3]: Perfil, f: number): string =>
  `M${n(cx + f * rx)} ${n(y)}C${n(cx + f * rx)} ${n(y - p1 * h)} ${n(cx + f * p2 * rx)} ${n(y - p3 * h)} ${n(cx)} ${n(y - h)}`;

/** Media luna de sombra en el lado derecho de una cúpula (entre los meridianos 1 y k). */
const lunaSombra = (cx: number, y: number, rx: number, h: number, p: Perfil, k: number): string =>
  meridiano(cx, y, rx, h, p, 1) +
  `C${n(cx + k * p[1] * rx)} ${n(y - p[2] * h)} ${n(cx + k * rx)} ${n(y - p[0] * h)} ${n(cx + k * rx)} ${n(y)}z`;

/** Nervios (gallones) de una cúpula. */
const nervios = (cx: number, y: number, rx: number, h: number, p: Perfil, fs: number[]): string =>
  fs.map((f) => (f === 0 ? `M${n(cx)} ${n(y)}V${n(y - h)}` : meridiano(cx, y, rx, h, p, f))).join("");

/** Fila de balaustres (trazos verticales cortos). */
const balaustres = (x0: number, x1: number, y: number, h: number, paso: number): string => {
  let d = "";
  for (let x = x0; x <= x1; x += paso) d += `M${n(x)} ${n(y)}v${n(h)}`;
  return d;
};

/** Catedral Nueva: Torre de las Campanas (con el encamisado en talud de 1755). */
function torreDeLasCampanas(c: Capas) {
  // Fuste
  c.luz += "M1728 250H1776V476H1718L1728 398Z";
  c.sombra += "M1776 250H1794V398L1803 476H1776Z";
  c.trazo += "M1728 328H1794M1727 398H1796";
  c.hueco += arco(1748, 284, 8, 24) + arco(1748, 346, 8, 20) + arco(1782, 290, 5, 20);
  // Cornisa sobre el fuste
  c.luz += rect(1723, 243, 53, 7);
  c.sombra += rect(1776, 243, 23, 7);
  c.brillo += "M1723 243.6H1776";
  // Cuerpo de campanas: dos vanos por cara
  c.luz += rect(1731, 188, 45, 55);
  c.sombra += rect(1776, 188, 16, 55);
  c.hueco += arco(1735, 198, 14, 38) + arco(1756, 198, 14, 38) + arco(1780, 203, 8, 33);
  // Cornisa, balaustrada y pináculos de esquina
  c.luz += rect(1727, 181, 49, 7) + rect(1730, 172, 46, 9);
  c.sombra += rect(1776, 181, 20, 7) + rect(1776, 172, 17, 9);
  c.brillo += "M1727 181.6H1776";
  c.trazo += balaustres(1733, 1790, 174, 6, 3);
  c.luz += pinaculo(1731, 172, 6, 22) + bola(1731, 149.5, 2) + pinaculo(1775, 172, 6, 22) + bola(1775, 149.5, 2);
  c.sombra += pinaculo(1791, 172, 5, 18) + bola(1791, 153.5, 1.7);
  // Cuerpo octogonal
  c.media += rect(1739, 126, 9, 46);
  c.luz += rect(1748, 126, 24, 46);
  c.sombra += rect(1772, 126, 11, 46);
  c.hueco += arco(1755, 134, 10, 30) + arco(1741, 138, 5, 24) + arco(1775, 138, 5, 24);
  c.luz += rect(1736, 119, 36, 7);
  c.sombra += rect(1772, 119, 14, 7);
  c.brillo += "M1736 119.6H1772";
  // Cupulín, linterna y chapitel
  c.luz += cupula(1761, 119, 22, 27);
  c.sombra += lunaSombra(1761, 119, 22, 27, CUPULA, 0.45);
  c.trazo += nervios(1761, 119, 22, 27, CUPULA, [-0.55, 0]);
  c.luz += rect(1755, 76, 12, 16) + rect(1753, 73, 16, 3) + cupula(1761, 73, 6, 8);
  c.luz += pinaculo(1761, 66, 5, 26) + bola(1761, 41, 2);
  c.hueco += rect(1759.5, 79, 3, 10);
  c.remate += "M1761 39V29M1758 32.5H1764";
}

/** Catedral Nueva: nave sur, crucero con cimborrio y cabecera. */
function catedralNueva(c: Capas) {
  c.media += "M1794 476V318H1925V476Z";
  c.brillo += "M1794 318.6H1925";
  for (const x of [1806, 1830, 1854, 1878, 1902]) {
    c.media += pinaculo(x, 318, 5, 17);
    c.hueco += ojiva(x + 8.5, 328, 7, 26);
  }
  // Basamento del crucero y pináculos
  c.media += rect(1925, 268, 80, 208);
  c.brillo += "M1925 268.6H2005";
  c.trazo += balaustres(1934, 1996, 262, 6, 3) + "M1925 300H2005M1945 268V476M1985 268V476";
  c.hueco += ojiva(1931, 308, 9, 34) + ojiva(1990, 308, 9, 34) + ojiva(1958.5, 312, 13, 40) + bola(1965, 287, 5);
  c.media += pinaculo(1929, 268, 6, 20) + bola(1929, 246.5, 1.8) + pinaculo(2001, 268, 6, 20) + bola(2001, 246.5, 1.8);
  // Tambor octogonal
  c.media += rect(1933, 222, 13, 46);
  c.luz += rect(1946, 222, 38, 46);
  c.sombra += rect(1984, 222, 13, 46);
  c.hueco += arco(1959, 231, 12, 30) + arco(1937, 234, 6, 26) + arco(1988, 234, 6, 26);
  c.luz += rect(1929, 216, 55, 6);
  c.sombra += rect(1984, 216, 17, 6);
  c.brillo += "M1929 216.6H1984";
  // Cúpula y linterna
  c.luz += cupula(1965, 216, 31, 40);
  c.sombra += lunaSombra(1965, 216, 31, 40, CUPULA, 0.42);
  c.trazo += nervios(1965, 216, 31, 40, CUPULA, [-0.62, 0, 0.62]);
  c.luz += rect(1958, 159, 14, 17) + rect(1956, 156, 18, 3) + cupula(1965, 156, 7, 10) + bola(1965, 144, 2);
  c.hueco += rect(1963, 162, 4, 11);
  c.remate += "M1965 142V131M1961.5 135H1968.5";
  // Cabecera
  c.media += "M2005 476V330H2062V476Z";
  c.media += pinaculo(2016, 330, 5, 16) + pinaculo(2038, 330, 5, 16) + pinaculo(2058, 330, 5, 16);
  c.brillo += "M2005 330.6H2062";
  c.hueco += ojiva(2023, 340, 7, 26) + ojiva(2045, 340, 7, 26);
}

/** Catedral Vieja: naves bajas, ábside y Torre del Gallo (cúpula gallonada con torrecillas). */
function torreDelGallo(c: Capas) {
  c.media += "M1796 476V366H1822V344H1914V360H1948C1962 362 1970 374 1972 392V476Z";
  c.brillo += "M1796 366.6H1822M1914 360.6H1948";
  c.hueco += arco(1804, 380, 8, 22) + arco(1930, 374, 7, 20) + arco(1952, 382, 6, 18);
  // Tambor: arquería inferior y superior
  c.luz += rect(1836, 312, 48, 32) + rect(1840, 290, 42, 22);
  c.sombra += rect(1884, 312, 16, 32) + rect(1882, 290, 14, 22);
  for (let i = 0; i < 5; i++) c.hueco += arco(1840 + i * 11.5, 318, 6, 18);
  for (let i = 0; i < 6; i++) c.hueco += arco(1843.5 + i * 8.6, 294, 4.4, 14);
  c.brillo += "M1834 312.6H1884";
  // Torrecillas de las esquinas
  c.luz += rect(1824, 300, 14, 46) + apuntada(1831, 300, 8, 20) + bola(1831, 279, 1.6);
  c.luz += rect(1898, 300, 8, 46) + apuntada(1905, 300, 8, 20) + bola(1905, 279, 1.6);
  c.sombra += rect(1906, 300, 6, 46) + lunaSombra(1905, 300, 8, 20, APUNTADA, 0.1);
  c.hueco += rect(1829.5, 312, 3, 13) + rect(1900.5, 312, 3, 13);
  c.trazo += "M1824 300.6H1838M1898 300.6H1912";
  // Cúpula gallonada con escamas
  c.luz += apuntada(1868, 290, 29, 54);
  c.sombra += lunaSombra(1868, 290, 29, 54, APUNTADA, 0.45);
  c.trazo += nervios(1868, 290, 29, 54, APUNTADA, [-0.66, -0.33, 0, 0.33, 0.66]);
  c.trazo += "M1842 275Q1868 268 1894 275M1848 258Q1868 252 1888 258";
  // Veleta del gallo
  c.remate += "M1868 236V224";
  c.luz += "M1864 224L1866 219L1865 216.5L1868 215.5L1869.5 218L1873 218.5L1870.5 220.5L1872.5 224Z";
}

/** Torre de la Clerecía: fuste y remate escalonado con pináculos (y desplazada `dy`). */
function torreClerecia(c: Capas, cx: number, dy: number) {
  const y = (v: number) => v + dy;
  c.luz += rect(cx - 15, y(236), 22, 240 - dy);
  c.sombra += rect(cx + 7, y(236), 8, 240 - dy);
  c.luz += rect(cx - 17, y(230), 24, 6) + rect(cx - 14, y(199), 21, 31) + rect(cx - 16, y(194), 23, 5);
  c.sombra += rect(cx + 7, y(230), 10, 6) + rect(cx + 7, y(199), 7, 31) + rect(cx + 7, y(194), 9, 5);
  c.brillo += `M${cx - 17} ${y(230.6)}H${cx + 7}M${cx - 16} ${y(194.6)}H${cx + 7}`;
  c.hueco += arco(cx - 8.5, y(204), 10, 23) + arco(cx - 6, y(252), 7, 18);
  c.luz += pinaculo(cx - 14, y(194), 3, 10) + bola(cx - 14, y(183.5), 1.3);
  c.sombra += pinaculo(cx + 13, y(194), 3, 10) + bola(cx + 13, y(183.5), 1.3);
  // Segundo y tercer cuerpo, cupulín
  c.luz += rect(cx - 10, y(173), 15, 21) + rect(cx - 12, y(169), 17, 4) + pinaculo(cx - 10, y(169), 2.6, 8);
  c.sombra += rect(cx + 5, y(173), 5, 21) + rect(cx + 5, y(169), 7, 4) + pinaculo(cx + 10, y(169), 2.6, 8);
  c.hueco += arco(cx - 5.5, y(177), 7, 14);
  c.luz += rect(cx - 6, y(157), 12, 12) + cupula(cx, y(157), 7, 10) + bola(cx, y(145), 1.6);
  c.hueco += rect(cx - 1.5, y(159.5), 3, 7);
  c.remate += `M${cx} ${y(143.5)}V${y(134)}M${cx - 3} ${y(137.5)}H${cx + 3}`;
}

/** Real Clerecía de San Marcos: cúpula (detrás), fachada y torres gemelas. */
function clerecia(fondo: Capas, medio: Capas) {
  const dy = 26; // más lejana: algo más baja que el cimborrio de la catedral
  const y = (v: number) => v + dy;
  fondo.media += rect(2220, y(228), 60, 40);
  fondo.hueco += arco(2228, y(235), 6, 20) + arco(2247, y(235), 6, 20) + arco(2266, y(235), 6, 20);
  fondo.luz += rect(2217, y(223), 48, 5);
  fondo.sombra += rect(2265, y(223), 18, 5);
  fondo.luz += cupula(2250, y(223), 31, 38);
  fondo.sombra += lunaSombra(2250, y(223), 31, 38, CUPULA, 0.42);
  fondo.trazo += nervios(2250, y(223), 31, 38, CUPULA, [-0.62, 0, 0.62]);
  fondo.luz += rect(2244, y(168), 12, 17) + rect(2242, y(165), 16, 3) + cupula(2250, y(165), 6, 9) + bola(2250, y(154), 1.8);
  fondo.hueco += rect(2248.5, y(171), 3, 10);
  fondo.remate += `M2250 ${y(152)}V${y(142)}M2247 ${y(145.5)}H2253`;
  // Fachada entre las torres, con ático central y balaustrada
  medio.media += rect(2195, y(262), 110, 214 - dy) + rect(2230, y(249), 40, 13);
  medio.media += pinaculo(2232, y(249), 3, 9) + pinaculo(2268, y(249), 3, 9) + pinaculo(2250, y(249), 4, 13);
  medio.brillo += `M2195 ${y(262.6)}H2305M2230 ${y(249.6)}H2270`;
  medio.trazo += balaustres(2226, 2229, y(255), 6, 3) + balaustres(2271, 2274, y(255), 6, 3);
  medio.hueco += arco(2242, y(280), 16, 34) + arco(2230, y(292), 7, 20) + arco(2263, y(292), 7, 20);
  medio.hueco += arco(2201, y(300), 7, 20) + arco(2292, y(300), 7, 20);
  medio.trazo += `M2195 ${y(334)}H2305M2226 ${y(262)}V476M2274 ${y(262)}V476`;
  torreClerecia(medio, 2210, dy);
  torreClerecia(medio, 2290, dy);
}

/** Iglesias secundarias del caserío (más tenues). */
function iglesiasLejanas(c: Capas) {
  // Torre con chapitel a la izquierda
  c.media += rect(1544, 358, 22, 118) + pinaculo(1555, 358, 28, 22) + bola(1555, 335, 1.6);
  c.hueco += arco(1547.5, 366, 6, 14) + arco(1556.5, 366, 6, 14);
  c.brillo += "M1542 358.6H1568";
  // Espadaña entre la catedral y la Clerecía
  c.media += rect(2098, 392, 28, 84) + rect(2104, 380, 16, 12) + pinaculo(2112, 380, 6, 9) + bola(2112, 370, 1.4);
  c.hueco += arco(2101.5, 397, 7, 14) + arco(2115.5, 397, 7, 14) + arco(2108.5, 383, 7, 9);
  // Iglesia con cúpula a la derecha
  c.media += rect(2458, 398, 44, 78) + rect(2466, 382, 28, 16) + cupula(2480, 382, 15, 18);
  c.media += rect(2477, 356, 6, 8) + bola(2480, 353, 1.4);
  c.hueco += arco(2474, 386, 5, 10) + arco(2482, 386, 5, 10);
}

function construirMonumentos() {
  const lejos = nuevas();
  const fondo = nuevas();
  const medio = nuevas();
  const frente = nuevas();
  iglesiasLejanas(lejos);
  catedralNueva(fondo);
  clerecia(fondo, medio);
  torreDeLasCampanas(medio);
  torreDelGallo(frente);
  return { lejos, fondo, medio, frente };
}

/** Monumentos por grupos de profundidad (del más lejano al más cercano). */
export const MONUMENTOS = construirMonumentos();

/* ─── Caserío (procedural, determinista) ─────────────────────────────── */

/** Cota de los tejados según x: la ladera sube hacia el conjunto monumental. */
export const perfilCaserio = (x: number): number => {
  const d = (x - 2000) / 560;
  return 502 - 80 / (1 + d * d);
};

type Hilera = { d: string; ventanas: [string, string, string]; parpadeo: string };

/**
 * Hilera de casas con tejados a dos aguas, faldones y chimeneas, y sus
 * ventanas encendidas (tres tonos: ámbar, crema y algún LED frío). El
 * contorno usa órdenes relativas con enteros para que el marcado sea corto.
 */
function hilera(semilla: number, dy: number, variacion: number, wMin: number, wMax: number, pLuz: number): Hilera {
  const rnd = crearPrng(semilla);
  const ventanas: [string, string, string] = ["", "", ""];
  let parpadeo = "";
  let x = 0;
  let d = `M0 ${CIUDAD.agua}`;
  while (x < CIUDAD.ancho) {
    const w = Math.round(entre(rnd, wMin, wMax));
    const top = Math.round(perfilCaserio(x + w / 2) + dy - rnd() * variacion);
    const t = rnd();
    d += `V${top}`;
    if (t < 0.45) {
      // Hastial a dos aguas
      const ph = Math.round(entre(rnd, 4, 10));
      const a = Math.round(w / 2);
      d += `l${a} ${-ph}l${w - a} ${ph}`;
    } else if (t < 0.85) {
      // Faldón (tejado visto desde el alero)
      const ph = Math.round(entre(rnd, 3, 7));
      const e = Math.min(Math.round(ph * 1.6), Math.floor(w / 2) - 2);
      d += `l${e} ${-ph}h${w - 2 * e}l${e} ${ph}`;
    } else {
      // Cubierta plana con chimenea
      const a = Math.round(entre(rnd, 0.2, 0.7) * w);
      d += `h${a}v-6h3v6h${w - a - 3}`;
    }
    // Ventanas encendidas
    const k = Math.floor(rnd() * 3.2);
    for (let i = 0; i < k; i++) {
      if (rnd() > pLuz) continue;
      const s = `M${m(x + entre(rnd, 3, Math.max(4, w - 6)))} ${m(top + entre(rnd, 5, 26))}h2`;
      const tono = rnd();
      if (tono < 0.04) parpadeo += s;
      else ventanas[tono < 0.66 ? 0 : tono < 0.92 ? 1 : 2] += s;
    }
    x += w;
  }
  d += `V${CIUDAD.agua}Z`;
  return { d, ventanas, parpadeo };
}

/** Ribera: arboleda y muro a la orilla del río (queda tapada por el puente salvo en los extremos). */
function ribera(): string {
  const rnd = crearPrng(909);
  const base = 546;
  let d = `M0 ${CIUDAD.agua}V${base}`;
  let x = 0;
  while (x < CIUDAD.ancho) {
    const w = Math.round(entre(rnd, 22, 48));
    if (rnd() < 0.78) {
      const h = Math.round(entre(rnd, 10, 28));
      d += `q${Math.round(w / 2)} ${-2 * h} ${w} 0`;
    } else {
      const h = Math.round(entre(rnd, 8, 16));
      d += `v${-h}h${w}v${h}`;
    }
    x += w;
  }
  return d + `V${CIUDAD.agua}Z`;
}

export const CASERIO = {
  trasera: hilera(1570, -4, 20, 16, 38, 0.55),
  delantera: hilera(1812, 26, 18, 20, 46, 0.7),
  ribera: ribera(),
};

/* ─── Puente Romano ──────────────────────────────────────────────────── */

function construirPuente() {
  const { x0, luz, pila, arcos, tablero, imposta, arranque } = PUENTE;
  const agua = CIUDAD.agua;
  const x1 = x0 + arcos * (luz + pila) + pila;
  let huecos = "";
  let roscas = "";
  let tajamares = "";
  for (let i = 0; i <= arcos; i++) {
    const px = x0 + i * (luz + pila);
    tajamares += `M${px + 4} ${agua}V${arranque - 8}L${px + pila / 2} ${arranque - 20}L${px + pila - 4} ${arranque - 8}V${agua}Z`;
    if (i === arcos) break;
    const x = px + pila;
    huecos += `M${x} ${agua}V${arranque}A${luz / 2} ${luz / 2} 0 0 1 ${x + luz} ${arranque}V${agua}Z`;
    roscas += `M${x} ${arranque}A${luz / 2} ${luz / 2} 0 0 1 ${x + luz} ${arranque}`;
  }
  return {
    x1,
    cuerpo: `M${x0 - 54} ${agua}L${x0} ${tablero}H${x1}L${x1 + 58} ${agua}Z`,
    huecos,
    roscas,
    tajamares,
    pretil: `M${x0} ${tablero + 0.6}H${x1}`,
    imposta: `M${x0 - 6} ${imposta}H${x1 + 7}`,
  };
}

export const PUENTE_D = construirPuente();

/* ─── Río: columnas de reflejos y estelas de luz ─────────────────────── */

/** Reflejos verticales de los monumentos iluminados, en tres niveles de intensidad. */
function construirReflejos(): [string, string, string] {
  const rnd = crearPrng(77);
  const capas: [string, string, string] = ["", "", ""];
  // [x del foco, semiancho, intensidad]
  const focos: [number, number, number][] = [
    [1761, 30, 1], [1868, 36, 0.9], [1965, 34, 1], [2210, 18, 0.85], [2250, 30, 0.8], [2290, 18, 0.85],
    [1555, 12, 0.55], [2112, 12, 0.55], [2480, 16, 0.55],
  ];
  for (const [cx, hw, k] of focos) {
    for (let y = 606 + rnd() * 4; y < 712; y += entre(rnd, 4.4, 6.6)) {
      const t = (y - 600) / 112;
      const w = hw * 2 * entre(rnd, 0.25, 1) * (1 - t * 0.4) * k;
      const x = cx + (rnd() - 0.5) * hw * 0.9 - w / 2;
      capas[t < 0.34 ? 0 : t < 0.67 ? 1 : 2] += `M${m(x)} ${n(y)}h${m(w)}`;
    }
  }
  // Destellos cortos de ventanas de la ribera
  for (let i = 0; i < 12; i++) {
    const cx = entre(rnd, 300, 3300);
    for (let y = 604 + rnd() * 6; y < 640 + rnd() * 20; y += entre(rnd, 5, 8)) {
      const w = entre(rnd, 3, 12);
      capas[1] += `M${m(cx - w / 2)} ${n(y)}h${m(w)}`;
    }
  }
  return capas;
}

export const REFLEJOS = construirReflejos();

export type Estela = { x: number; y: number; w: number; h: number; tono: "oro" | "cian"; o: number; g: number };

/** Estelas horizontales de luz sobre el agua (el guiño a las «estelas» de JUTE, pero sereno). */
function construirEstelas(): Estela[] {
  const rnd = crearPrng(4242);
  const out: Estela[] = [];
  for (let i = 0; i < 22; i++) {
    const y = entre(rnd, 588, 714);
    const w = entre(rnd, 280, 1150);
    // Una de cada tres cae dentro del encuadre de móvil (en torno al foco monumental)
    const x = i % 3 === 0 ? entre(rnd, 1450, 2450 - w * 0.4) : entre(rnd, -100, 3500 - w);
    out.push({
      x: Math.round(x),
      y: Math.round(y * 10) / 10,
      w: Math.round(w),
      h: Math.round(entre(rnd, 1.2, 2.8) * 10) / 10,
      tono: rnd() < 0.55 ? "oro" : "cian",
      o: Math.round(entre(rnd, 0.45, 0.9) * 100) / 100,
      g: i % 3,
    });
  }
  return out;
}

export const ESTELAS = construirEstelas();

/** «Paquetes de datos»: cometas cian que viajan río abajo (de derecha a izquierda, como el Tormes). */
export const PAQUETES = [
  { y: 612, x: 3000, dur: 26, delay: -4 },
  { y: 648, x: 3200, dur: 34, delay: -19 },
  { y: 681, x: 3100, dur: 30, delay: -11 },
  { y: 699, x: 3300, dur: 38, delay: -27 },
] as const;
