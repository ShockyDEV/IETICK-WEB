import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { fontVariables } from "@/lib/fonts";
import { AdminToaster } from "@/components/admin/AdminToaster";

/**
 * ROOT LAYOUT del panel (/backstage/**). La web pública usa otro root layout
 * en app/(site)/[locale]/layout.tsx, así que este define su propio <html>.
 * Comparte las tipografías de la web (src/lib/fonts.ts) y no se indexa.
 */
export const metadata: Metadata = {
  title: { default: "Panel · ieTIC 2027", template: "%s · Panel ieTIC 2027" },
  description: "Panel de administración del programa de ieTIC 2027.",
  applicationName: "ieTIC 2027 · Panel",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: "same-origin",
};

export const viewport: Viewport = {
  themeColor: "#06222F",
  width: "device-width",
  initialScale: 1,
};

export default function BackstageRootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior: globals.css usa scroll-behavior:smooth; así Next lo
    // desactiva durante las transiciones de ruta (y no avisa en consola).
    <html lang="es" className={fontVariables} data-scroll-behavior="smooth">
      <body className="min-h-dvh bg-papel text-tinta">
        {children}
        <AdminToaster />
      </body>
    </html>
  );
}
