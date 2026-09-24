import type { L10n } from "@/lib/i18n";

/**
 * Datos generales del congreso. Todo lo que procede del material de la
 * organización (correo de 23-09-2026: programa provisional + logos) está
 * marcado como tal; lo demás es propuesta a validar (ver docs/ANALISIS.md).
 */
export const SITE = {
  shortName: "ieTIC 2027",
  // Deducido: ieTIC2026 fue la XII edición (Madrid, 19-20 feb 2026).
  edition: "XIII",
  year: 2027,
  days: ["2027-02-11", "2027-02-12"] as const,
  // Inicio oficial (hora de Madrid) para la cuenta atrás
  startsAt: { day: "2027-02-11", time: "09:00" },
  endsAt: { day: "2027-02-12", time: "14:00" },

  fullName: {
    es: "XIII Conferencia Ibérica de Innovación en Educación con TIC",
    pt: "XIII Conferência Ibérica de Inovação na Educação com TIC",
  } satisfies L10n,
  seriesName: {
    es: "Conferencia Ibérica de Innovación en Educación con TIC",
    pt: "Conferência Ibérica de Inovação na Educação com TIC",
  } satisfies L10n,
  // Texto del logo oficial
  tagline: {
    es: "Innovación educativa con TIC",
    pt: "Inovação educativa com TIC",
  } satisfies L10n,
  // Lema del programa provisional (literal)
  lema: {
    es: "Tecnologías para mejorar el aprendizaje en el ecosistema de Ciencia Abierta",
    pt: "Tecnologias para melhorar a aprendizagem no ecossistema da Ciência Aberta",
  } satisfies L10n,
  sublema: {
    es: "Recursos Educativos Abiertos y Diseño Universal de Aprendizaje",
    pt: "Recursos Educativos Abertos e Desenho Universal para a Aprendizagem",
  } satisfies L10n,
  datesLabel: {
    es: "11 y 12 de febrero de 2027",
    pt: "11 e 12 de fevereiro de 2027",
  } satisfies L10n,
  datesShort: {
    es: "11–12 feb 2027",
    pt: "11–12 fev 2027",
  } satisfies L10n,
  city: "Salamanca",
  venue: {
    name: {
      es: "Instituto Universitario de Ciencias de la Educación (IUCE)",
      pt: "Instituto Universitário de Ciências da Educação (IUCE)",
    } satisfies L10n,
    short: { es: "IUCE · Universidad de Salamanca", pt: "IUCE · Universidade de Salamanca" } satisfies L10n,
    building: {
      es: "Edificio Solís · Campus de Educación",
      pt: "Edifício Solís · Campus de Educação",
    } satisfies L10n,
    address: "Paseo de Canalejas, 169 · 37008 Salamanca",
    // Paseo de Canalejas, 169 (OpenStreetMap / Nominatim)
    lat: 40.95874,
    lon: -5.65984,
    email: "iuce@usal.es",
    phone: "+34 923 294 634",
    web: "https://iuce.usal.es",
  },
};

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3027").replace(/\/$/, "");
}

/**
 * Algunas ediciones anteriores de ieTIC (solo datos verificados en fuentes
 * públicas; ver docs/ANALISIS.md). No es una lista exhaustiva.
 */
export const EDICIONES: {
  year: number;
  edition: string;
  place: L10n;
  note?: L10n;
  current?: boolean;
}[] = [
  {
    year: 2013,
    edition: "III",
    place: { es: "Salamanca", pt: "Salamanca" },
    note: { es: "Facultad de Educación · Universidad de Salamanca", pt: "Faculdade de Educação · Universidade de Salamanca" },
  },
  {
    year: 2016,
    edition: "IV",
    place: { es: "Bragança", pt: "Bragança" },
    note: { es: "Instituto Politécnico de Bragança", pt: "Instituto Politécnico de Bragança" },
  },
  {
    year: 2023,
    edition: "IX",
    place: { es: "Formato híbrido", pt: "Formato híbrido" },
    note: { es: "IPB · USAL · Universidade Aberta · UCM", pt: "IPB · USAL · Universidade Aberta · UCM" },
  },
  {
    year: 2025,
    edition: "XI",
    place: { es: "Madrid", pt: "Madrid" },
    note: { es: "UNED · «Educación 5.0»", pt: "UNED · «Educação 5.0»" },
  },
  {
    year: 2026,
    edition: "XII",
    place: { es: "Madrid", pt: "Madrid" },
    note: { es: "Tendencias tecnológicas emergentes", pt: "Tendências tecnológicas emergentes" },
  },
  {
    year: 2027,
    edition: "XIII",
    place: { es: "Salamanca", pt: "Salamanca" },
    note: { es: "IUCE · Universidad de Salamanca", pt: "IUCE · Universidade de Salamanca" },
    current: true,
  },
];
