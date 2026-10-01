import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import { fontVariables } from "@/lib/fonts";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RevealObserver } from "@/components/ui/reveal-observer";
import { REVEAL_BOOT } from "@/lib/reveal-boot";
import { isLocale, LOCALES, LOCALE_LABELS, pick, type Locale } from "@/lib/i18n";
import { SITE, siteUrl } from "@/content/site";

/** Solo existen /… (es) y /pt/…; cualquier otro prefijo es 404. */
export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const title = `ieTIC 2027 · ${pick(SITE.fullName, locale)}`;
  const description = `${pick(SITE.lema, locale)}. ${pick(SITE.datesLabel, locale)}, ${pick(SITE.where, locale)}.`;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: "%s · ieTIC 2027" },
    description,
    applicationName: "ieTIC 2027",
    openGraph: {
      type: "website",
      siteName: "ieTIC 2027",
      title,
      description,
      locale: LOCALE_LABELS[locale].og,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_LABELS[l].og),
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
  };
}

export const viewport: Viewport = {
  themeColor: "#06222F",
  width: "device-width",
  initialScale: 1,
};

export default async function SiteLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    // suppressHydrationWarning: el script de <head> añade data-revela antes de hidratar
    <html lang={LOCALE_LABELS[locale].htmlLang} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <RevealObserver />
        <SiteHeader locale={locale} />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
