import { EB_Garamond, IBM_Plex_Mono, Inter, Sora } from "next/font/google";

/**
 * Tipografías (autoalojadas por next/font en el build):
 *   · Sora — titulares: geométrica y redondeada, emparenta con las letras del logo.
 *   · Inter — texto, horas y datos (con cifras tabulares).
 *   · EB Garamond, en cursiva — antetítulos, fechas y notas: la letra del
 *     Renacimiento, la de la Salamanca de las Escuelas, como contrapunto
 *     humano a la geometría del logo.
 *   · IBM Plex Mono — solo en el panel /backstage (horas, claves, ids).
 */
export const fontDisplay = Sora({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const fontSans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

// Español y portugués caben en el subconjunto «latin» (á, ñ, ç, ã, õ…)
export const fontSerif = EB_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--font-serif",
  display: "swap",
});

export const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

/** Web pública */
export const fontVariables = `${fontDisplay.variable} ${fontSans.variable} ${fontSerif.variable}`;
/** Panel de administración */
export const adminFontVariables = `${fontVariables} ${fontMono.variable}`;
