/**
 * Idiomas del sitio. ieTIC es una conferencia ibérica: español (por defecto,
 * sin prefijo en la URL) y portugués (bajo /pt).
 *
 * El middleware reescribe internamente /ruta → /es/ruta, de modo que todas
 * las páginas públicas viven en `app/(site)/[locale]/…` sin duplicarse.
 */
export const LOCALES = ["es", "pt"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Texto bilingüe. */
export type L10n<T = string> = Record<Locale, T>;

/** Elige la variante del idioma (con caída al español). */
export function pick<T>(value: L10n<T>, locale: Locale): T {
  return value[locale] ?? value.es;
}

/** Ruta pública localizada: href("pt", "/programa") → "/pt/programa". */
export function href(locale: Locale, path: string = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Quita el prefijo de idioma de una ruta: "/pt/sede" → "/sede". */
export function stripLocale(pathname: string): string {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

export const LOCALE_LABELS: L10n<{ short: string; long: string; htmlLang: string; og: string }> = {
  es: { short: "ES", long: "Español", htmlLang: "es", og: "es_ES" },
  pt: { short: "PT", long: "Português", htmlLang: "pt-PT", og: "pt_PT" },
};
