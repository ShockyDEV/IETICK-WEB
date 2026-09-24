import type { Metadata } from "next";
import { href, type Locale } from "@/lib/i18n";

/**
 * Metadatos de una página pública: título, descripción, canonical y
 * alternativas hreflang ES/PT (+ x-default en español).
 */
export function pageMetadata(
  locale: Locale,
  path: string,
  title: string | null,
  description?: string,
): Metadata {
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical: href(locale, path),
      languages: { es: href("es", path), pt: href("pt", path), "x-default": href("es", path) },
    },
    openGraph: {
      ...(title ? { title: `${title} · ieTIC 2027` } : {}),
      ...(description ? { description } : {}),
      url: href(locale, path),
    },
  };
}
