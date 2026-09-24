import { IBM_Plex_Mono, Inter, Sora } from "next/font/google";

/**
 * Tipografías (autoalojadas por next/font en el build):
 *   · Sora — titulares: geométrica y redondeada, emparenta con las letras del logo.
 *   · Inter — texto: máxima legibilidad en pantalla.
 *   · IBM Plex Mono — horas del programa, códigos y antetítulos (toque «TIC»).
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

export const fontMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const fontVariables = `${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`;
