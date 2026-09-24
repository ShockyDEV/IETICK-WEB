import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";
import { href, LOCALES } from "@/lib/i18n";

const PATHS = ["/", "/congreso", "/programa", "/ponentes", "/comunicaciones", "/inscripcion", "/comites", "/sede"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${base}${href(locale, path)}`,
      changeFrequency: path === "/programa" ? ("daily" as const) : ("weekly" as const),
      priority: path === "/" ? 1 : path === "/programa" ? 0.9 : 0.7,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${base}${href(l, path)}`])) },
    })),
  );
}
