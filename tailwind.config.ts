import type { Config } from "tailwindcss";

/**
 * Tokens de diseño de ieTIC 2027.
 *
 * Paleta muestreada del logo oficial del congreso (fondo poligonal azul
 * petróleo #167492, letras cian #98DDED, «e» hielo #DAF5FE) y completada con
 * un dorado «piedra de Villamayor» como acento propio de Salamanca, la
 * ciudad dorada. Ese dorado es el color de las llamadas a la acción y del
 * marcador «en directo» del programa.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Fondos oscuros (cabecera, héroe, bandas)
        noche: {
          950: "#031822",
          900: "#06222F",
          800: "#0A2F40",
          700: "#0E3D52",
          600: "#134B63",
        },
        // Azul petróleo del logo
        mar: {
          50: "#EBF6FA",
          100: "#D3EDF5",
          200: "#A9DBEA",
          300: "#73C2DA",
          400: "#3EA3C3",
          500: "#1C86A7",
          600: "#167492",
          700: "#135E77",
          800: "#104B5F",
          900: "#0C3A4A",
        },
        // Cian y hielo de las letras del logo
        cian: {
          100: "#DAF5FE",
          200: "#BDEBF6",
          300: "#98DDED",
          400: "#6FCDE4",
          500: "#44BCD9",
        },
        // Dorado Villamayor
        oro: {
          50: "#FDF7EA",
          100: "#FAEBC8",
          200: "#F5D68F",
          300: "#F0C263",
          400: "#EBAE3F",
          500: "#DA9724",
          600: "#B97A16",
          700: "#8F5E12",
          800: "#6B4610",
        },
        // Texto
        tinta: {
          DEFAULT: "#0B2A36",
          suave: "#3F5B67",
          tenue: "#5A7682",
        },
        linea: "#D5E6EC",
        papel: "#F5FAFB",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "Consolas", "monospace"],
      },
      maxWidth: {
        site: "76rem",
      },
      boxShadow: {
        tarjeta: "0 1px 2px rgba(6, 34, 47, 0.06), 0 8px 24px -12px rgba(6, 34, 47, 0.18)",
        elevada: "0 2px 4px rgba(6, 34, 47, 0.08), 0 24px 48px -16px rgba(6, 34, 47, 0.35)",
        brillo: "0 0 0 1px rgba(152, 221, 237, 0.25), 0 0 32px -4px rgba(152, 221, 237, 0.45)",
      },
      keyframes: {
        latido: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.8)" },
        },
        titilar: {
          "0%, 100%": { opacity: "0.25" },
          "50%": { opacity: "1" },
        },
        aparecer: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        latido: "latido 1.6s ease-in-out infinite",
        titilar: "titilar 4s ease-in-out infinite",
        aparecer: "aparecer 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
