/**
 * Geometría del cielo: malla low-poly (eco del fondo poligonal del logo),
 * estrellas y la constelación/red de conocimiento abierto.
 * Todo determinista (PRNG con semilla fija).
 */
import { crearPrng, entre, n } from "./prng";

/** Lienzo del cielo del héroe (se recorta con `xMidYMid slice`). */
export const CIELO = { ancho: 1600, alto: 1000 } as const;

/* ─── Malla low-poly ─────────────────────────────────────────────────── */

export type CapaMalla = { d: string; color: string; o: number };

type OpcionesMalla = {
  semilla: number;
  ancho: number;
  alto: number;
  nx: number;
  ny: number;
  /** Desplazamiento máximo de cada vértice, en fracción de celda. */
  jitter: number;
  /** Intensidad base según la posición del baricentro (0…1). */
  alfa: (x: number, y: number) => number;
  colores: readonly string[];
  /** Opacidades a las que se cuantiza cada faceta (pocas capas = poco marcado). */
  niveles: readonly number[];
};

/**
 * Triangulación de una rejilla con vértices desplazados. Cada faceta se asigna
 * a una capa (color × nivel de opacidad), así toda la malla ocupa pocos <path>.
 */
export function mallaLowPoly(o: OpcionesMalla): CapaMalla[] {
  const rnd = crearPrng(o.semilla);
  const cw = o.ancho / o.nx;
  const ch = o.alto / o.ny;
  const P: [number, number][][] = [];
  for (let i = 0; i <= o.nx; i++) {
    P[i] = [];
    for (let j = 0; j <= o.ny; j++) {
      let x = i * cw;
      let y = j * ch;
      if (i > 0 && i < o.nx) x += (rnd() - 0.5) * 2 * o.jitter * cw;
      if (j > 0 && j < o.ny) y += (rnd() - 0.5) * 2 * o.jitter * ch;
      P[i][j] = [x, y];
    }
  }
  const capas: string[] = new Array(o.colores.length * o.niveles.length).fill("");
  const tri = (a: [number, number], b: [number, number], c: [number, number]) => {
    const cx = (a[0] + b[0] + c[0]) / 3;
    const cy = (a[1] + b[1] + c[1]) / 3;
    // Intensidad relativa (0…~1,2) → nivel de opacidad
    const v = o.alfa(cx, cy) * entre(rnd, 0.15, 1.25);
    const k = Math.min(o.niveles.length - 1, Math.floor(v * o.niveles.length));
    const col = Math.floor(rnd() * o.colores.length);
    if (v < 0.12) return; // faceta «vacía»: deja ver el fondo
    capas[col * o.niveles.length + k] += `M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}L${n(c[0])} ${n(c[1])}Z`;
  };
  for (let i = 0; i < o.nx; i++) {
    for (let j = 0; j < o.ny; j++) {
      const p00 = P[i][j];
      const p10 = P[i + 1][j];
      const p01 = P[i][j + 1];
      const p11 = P[i + 1][j + 1];
      if (rnd() < 0.5) {
        tri(p00, p10, p11);
        tri(p00, p11, p01);
      } else {
        tri(p00, p10, p01);
        tri(p10, p11, p01);
      }
    }
  }
  const out: CapaMalla[] = [];
  o.colores.forEach((color, ci) =>
    o.niveles.forEach((nivel, li) => {
      const d = capas[ci * o.niveles.length + li];
      if (d) out.push({ d, color, o: nivel });
    }),
  );
  return out;
}

/** Malla del cielo del héroe: más presente arriba a la derecha, casi nula sobre el texto y el horizonte. */
export const MALLA_CIELO = mallaLowPoly({
  semilla: 2027,
  ancho: CIELO.ancho,
  alto: CIELO.alto,
  nx: 8,
  ny: 5,
  jitter: 0.32,
  alfa: (x, y) => (0.25 + 0.75 * (x / CIELO.ancho)) * (1 - 0.8 * (y / CIELO.alto)),
  colores: ["#1C86A7", "#98DDED"],
  niveles: [0.025, 0.045, 0.07],
});

/* ─── Estrellas ──────────────────────────────────────────────────────── */

/** Cuatro grupos de estrellas: fijas, dos de titileo y unas pocas brillantes. */
function construirEstrellas(): [string, string, string, string] {
  const rnd = crearPrng(311);
  const g: [string, string, string, string] = ["", "", "", ""];
  for (let i = 0; i < 150; i++) {
    const x = entre(rnd, 0, CIELO.ancho);
    const u = rnd();
    const y = u * u * 640; // más densas arriba, raras cerca del horizonte
    const t = rnd();
    const k = t < 0.55 ? 0 : t < 0.78 ? 1 : t < 0.95 ? 2 : 3;
    g[k] += `M${n(x)} ${n(y)}h.1`;
  }
  return g;
}

export const ESTRELLAS = construirEstrellas();

/* ─── Constelación: red de ciencia abierta ───────────────────────────── */

export type Nodo = { x: number; y: number; r: number; g: number; hub: boolean };

function construirConstelacion() {
  const rnd = crearPrng(1218);
  const nodos: Nodo[] = [];
  const lejos = (x: number, y: number, dmin: number) =>
    nodos.every((p) => (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y) >= dmin * dmin);

  // Red principal: arriba a la derecha, por encima de los monumentos
  for (let intentos = 0; nodos.length < 36 && intentos < 6000; intentos++) {
    const x = entre(rnd, 560, 1580);
    const y = entre(rnd, 56, 336);
    const peso = (0.15 + 0.85 * ((x - 560) / 1020)) * (1 - 0.45 * (y / 336));
    if (rnd() > peso || !lejos(x, y, 74)) continue;
    nodos.push({ x, y, r: entre(rnd, 1.3, 2.4), g: Math.floor(rnd() * 3), hub: false });
  }
  // Unos pocos nodos tenues sobre la zona del texto
  const principales = nodos.length;
  for (let intentos = 0; nodos.length < principales + 6 && intentos < 2000; intentos++) {
    const x = entre(rnd, 40, 560);
    const y = entre(rnd, 30, 230);
    if (!lejos(x, y, 120)) continue;
    nodos.push({ x, y, r: entre(rnd, 1, 1.6), g: Math.floor(rnd() * 3), hub: false });
  }
  // Nodos «hub» (con halo): los de la red principal más a la derecha y arriba
  const orden = nodos
    .slice(0, principales)
    .map((p, i) => ({ i, s: p.y < 120 ? -1e9 : p.x - p.y * 0.8 + rnd() * 300 }))
    .sort((a, b) => b.s - a.s);
  for (const { i } of orden.slice(0, 5)) {
    nodos[i].hub = true;
    nodos[i].r = 2.8;
  }

  // Enlaces: cada nodo con sus vecinos más próximos
  const clave = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const enlaces = new Map<string, [number, number]>();
  const vecinos: number[][] = nodos.map(() => []);
  nodos.forEach((p, i) => {
    const cercanos = nodos
      .map((q, j) => ({ j, d: (q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, p.hub ? 4 : 2)
      .filter((o) => o.d < 205 * 205);
    for (const { j } of cercanos) {
      const k = clave(i, j);
      if (!enlaces.has(k)) {
        enlaces.set(k, [i, j]);
        vecinos[i].push(j);
        vecinos[j].push(i);
      }
    }
  });
  let lineas = "";
  for (const [a, b] of enlaces.values()) {
    lineas += `M${n(nodos[a].x)} ${n(nodos[a].y)}L${n(nodos[b].x)} ${n(nodos[b].y)}`;
  }

  // Pulsos de datos: recorridos de 3–5 enlaces que parten de los hubs
  const pulsos: string[] = [];
  const inicios = nodos.map((p, i) => ({ p, i })).filter((o) => o.i < principales && vecinos[o.i].length >= 2);
  for (let k = 0; k < 6 && inicios.length > 0; k++) {
    let actual = inicios[Math.floor(rnd() * inicios.length)].i;
    const visitados = new Set([actual]);
    let d = `M${n(nodos[actual].x)} ${n(nodos[actual].y)}`;
    const largo = 3 + Math.floor(rnd() * 3);
    let pasos = 0;
    for (; pasos < largo; pasos++) {
      const libres = vecinos[actual].filter((j) => !visitados.has(j));
      if (libres.length === 0) break;
      actual = libres[Math.floor(rnd() * libres.length)];
      visitados.add(actual);
      d += `L${n(nodos[actual].x)} ${n(nodos[actual].y)}`;
    }
    if (pasos >= 2) pulsos.push(d);
  }

  return { nodos, lineas, pulsos };
}

export const CONSTELACION = construirConstelacion();

/**
 * Nodos como puntos de trazo redondeado (mucho más ligeros que <circle>):
 * por cada grupo de titileo, [pequeños, grandes, tenues sobre el texto].
 */
export const NODOS_D: [string, string, string][] = [0, 1, 2].map((g) => {
  const capas: [string, string, string] = ["", "", ""];
  for (const p of CONSTELACION.nodos) {
    if (p.g !== g) continue;
    const k = p.x < 560 ? 2 : p.r >= 1.9 ? 1 : 0;
    capas[k] += `M${n(p.x)} ${n(p.y)}h.1`;
  }
  return capas;
});
