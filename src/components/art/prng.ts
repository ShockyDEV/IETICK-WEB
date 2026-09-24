/**
 * Utilidades deterministas para las ilustraciones SVG.
 *
 * Todo lo «aleatorio» (estrellas, malla, ventanas, casas…) sale de un PRNG con
 * semilla fija, y solo se usan operaciones aritméticas exactas en IEEE-754
 * (+, −, ×, ÷, √), de modo que el marcado generado en el servidor y en el
 * navegador es idéntico byte a byte (sin desajustes de hidratación).
 */

/** Generador pseudoaleatorio mulberry32: devuelve números en [0, 1). */
export function crearPrng(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Redondea a un decimal (marcado más corto). */
export const r1 = (v: number): number => Math.round(v * 10) / 10;

/** Número → texto con un decimal como máximo. */
export const n = (v: number): string => String(r1(v));

/** Valor aleatorio en [a, b). */
export const entre = (rnd: () => number, a: number, b: number): number => a + rnd() * (b - a);

/* ─── Primitivas de trazado (devuelven subtrayectos para el atributo `d`) ─── */

/** Rectángulo. */
export const rect = (x: number, y: number, w: number, h: number): string =>
  `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`;

/** Hueco de medio punto: `y` es la clave del arco y `h` la altura total. */
export const arco = (x: number, y: number, w: number, h: number): string => {
  const r = w / 2;
  return `M${n(x)} ${n(y + h)}V${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w)} ${n(y + r)}V${n(y + h)}z`;
};

/** Hueco apuntado (ojival). */
export const ojiva = (x: number, y: number, w: number, h: number): string =>
  `M${n(x)} ${n(y + h)}V${n(y + w * 0.75)}Q${n(x)} ${n(y + w * 0.2)} ${n(x + w / 2)} ${n(y)}` +
  `Q${n(x + w)} ${n(y + w * 0.2)} ${n(x + w)} ${n(y + w * 0.75)}V${n(y + h)}z`;

/** Cúpula de perfil semielíptico apoyada en (cx, y). */
export const cupula = (cx: number, y: number, rx: number, h: number): string =>
  `M${n(cx - rx)} ${n(y)}C${n(cx - rx)} ${n(y - h * 0.62)} ${n(cx - rx * 0.56)} ${n(y - h)} ${n(cx)} ${n(y - h)}` +
  `C${n(cx + rx * 0.56)} ${n(y - h)} ${n(cx + rx)} ${n(y - h * 0.62)} ${n(cx + rx)} ${n(y)}z`;

/** Cúpula apuntada / gallonada (Torre del Gallo, chapiteles de torrecillas). */
export const apuntada = (cx: number, y: number, rx: number, h: number): string =>
  `M${n(cx - rx)} ${n(y)}C${n(cx - rx)} ${n(y - h * 0.52)} ${n(cx - rx * 0.32)} ${n(y - h * 0.8)} ${n(cx)} ${n(y - h)}` +
  `C${n(cx + rx * 0.32)} ${n(y - h * 0.8)} ${n(cx + rx)} ${n(y - h * 0.52)} ${n(cx + rx)} ${n(y)}z`;

/** Pináculo u obelisco (triángulo estrecho). */
export const pinaculo = (cx: number, y: number, w: number, h: number): string =>
  `M${n(cx - w / 2)} ${n(y)}L${n(cx)} ${n(y - h)}L${n(cx + w / 2)} ${n(y)}z`;

/** Bola (círculo como trayecto). */
export const bola = (cx: number, cy: number, r: number): string =>
  `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0z`;
