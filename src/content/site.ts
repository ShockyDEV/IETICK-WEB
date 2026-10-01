import type { L10n } from "@/lib/i18n";

/**
 * Datos generales del congreso. Todo lo que procede del material de la
 * organización (correo de 23-09-2026: programa provisional + logos) está
 * marcado como tal; lo demás es propuesta a validar (ver docs/ANALISIS.md).
 */
export const SITE = {
  shortName: "ieTIC 2027",
  // Serie completa verificada en las actas del IPB: 2011 I … 2026 XII (UCM, Madrid).
  edition: "XIII",
  year: 2027,
  days: ["2027-02-11", "2027-02-12"] as const,
  // Inicio oficial (hora de Madrid) para la cuenta atrás
  startsAt: { day: "2027-02-11", time: "09:00" },
  endsAt: { day: "2027-02-12", time: "14:00" },

  fullName: {
    es: "XIII Conferencia Ibérica de Innovación en la Educación con TIC",
    pt: "XIII Conferência Ibérica de Inovação na Educação com TIC",
  } satisfies L10n,
  seriesName: {
    es: "Conferencia Ibérica de Innovación en la Educación con TIC",
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
  // Modalidad híbrida (documento de la organización, 01-10-2026)
  where: { es: "Salamanca y en línea", pt: "Salamanca e online" } satisfies L10n,
  venue: {
    name: {
      es: "Instituto Universitario de Ciencias de la Educación (IUCE)",
      pt: "Instituto Universitário de Ciências da Educação (IUCE)",
    } satisfies L10n,
    short: { es: "IUCE, Universidad de Salamanca", pt: "IUCE, Universidade de Salamanca" } satisfies L10n,
    building: {
      es: "Edificio Solís, Campus de Educación",
      pt: "Edifício Solís, Campus de Educação",
    } satisfies L10n,
    address: "Paseo de Canalejas, 169, 37008 Salamanca",
    // Paseo de Canalejas, 169 (OpenStreetMap / Nominatim)
    lat: 40.95874,
    lon: -5.65984,
    web: "https://solis.usal.es", // web nueva del IUCE
  },
  // Contactos del congreso (documento de la organización, 01-10-2026)
  contact: {
    general: "ietic@ipb.pt",
    secretaria: "secretaria.ietic27@usal.es",
  },
  // Inscripción: formulario previo + matrícula y pago en el Centro de
  // Formación Permanente de la USAL
  registration: {
    form: "https://forms.gle/Ju4LaDBYRtZhFyE96",
    payment: "https://vaporetto.usal.es/preactform/listaCursos?tipocur=sm",
    courseName:
      "Conferencia Ibérica de Innovación en la Educación con Tecnologías de la Información y Comunicación - ietic2027",
    helpEmail: "formacionpermanente@usal.es",
    helpPhone: "923 294 500",
    helpExt: "3050 / 1174",
  },
  // Envío de comunicaciones y plantillas (public/descargas/)
  submission: {
    easychair: "https://easychair.org/conferences/?conf=ietic2027",
    templateAbstract: "/descargas/ieTIC2027_Plantilla_resumen.docx",
    templateFull: "/descargas/ieTIC2027_Plantilla_texto_completo.docx",
  },
};

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3027").replace(/\/$/, "");
}

/**
 * Todas las ediciones de ieTIC. Números y actas verificados en el repositorio
 * del Instituto Politécnico de Bragança (ietic.unipb.pt → «Edições
 * anteriores»; enlaces Handle permanentes hdl.handle.net/10198/…). Sedes:
 * solo las verificadas (2013 USAL; 2016 IPB; 2023 Salamanca y videoconferencia
 * según su CFP de EasyChair; 2025 UNED; 2026 Facultad de Educación de la UCM).
 */
export interface EdicionLink {
  kind: "actas" | "resumenes" | "web";
  url: string;
}

export const EDICIONES: {
  year: number;
  edition: string;
  place?: L10n;
  note?: L10n;
  links?: EdicionLink[];
  current?: boolean;
}[] = [
  {
    year: 2011,
    edition: "I",
    links: [
      { kind: "actas", url: "https://hdl.handle.net/10198/7431" },
      { kind: "resumenes", url: "https://hdl.handle.net/10198/7419" },
    ],
  },
  { year: 2012, edition: "II", links: [{ kind: "actas", url: "https://hdl.handle.net/10198/17964" }] },
  {
    year: 2013,
    edition: "III",
    place: { es: "Salamanca", pt: "Salamanca" },
    note: { es: "Facultad de Educación, USAL", pt: "Faculdade de Educação, USAL" },
    links: [{ kind: "actas", url: "https://hdl.handle.net/10198/17966" }],
  },
  {
    year: 2016,
    edition: "IV",
    place: { es: "Bragança", pt: "Bragança" },
    note: { es: "Instituto Politécnico de Bragança", pt: "Instituto Politécnico de Bragança" },
    links: [{ kind: "actas", url: "https://hdl.handle.net/10198/13363" }],
  },
  {
    year: 2019,
    edition: "V",
    links: [
      { kind: "actas", url: "https://hdl.handle.net/10198/17747" },
      { kind: "resumenes", url: "https://hdl.handle.net/10198/18572" },
    ],
  },
  {
    year: 2020,
    edition: "VI",
    links: [
      { kind: "actas", url: "https://hdl.handle.net/10198/19663" },
      { kind: "resumenes", url: "https://hdl.handle.net/10198/19662" },
    ],
  },
  {
    year: 2021,
    edition: "VII",
    links: [
      { kind: "actas", url: "https://hdl.handle.net/10198/24493" },
      { kind: "resumenes", url: "https://hdl.handle.net/10198/23347" },
    ],
  },
  {
    year: 2022,
    edition: "VIII",
    links: [
      { kind: "actas", url: "https://hdl.handle.net/10198/25454" },
      { kind: "resumenes", url: "https://hdl.handle.net/10198/24666" },
    ],
  },
  {
    year: 2023,
    edition: "IX",
    place: { es: "Salamanca", pt: "Salamanca" },
    note: { es: "Presencial y por videoconferencia", pt: "Presencial e por videoconferência" },
    links: [{ kind: "resumenes", url: "https://hdl.handle.net/10198/26023" }],
  },
  { year: 2024, edition: "X" },
  {
    year: 2025,
    edition: "XI",
    place: { es: "Madrid", pt: "Madrid" },
    note: { es: "UNED, «Educación 5.0»", pt: "UNED, «Educação 5.0»" },
    links: [{ kind: "web", url: "https://multiweb.uned.es/w41931/home" }],
  },
  {
    year: 2026,
    edition: "XII",
    place: { es: "Madrid", pt: "Madrid" },
    note: { es: "Facultad de Educación, UCM", pt: "Faculdade de Educação, UCM" },
    links: [{ kind: "web", url: "https://ietic.unipb.pt/" }],
  },
  {
    year: 2027,
    edition: "XIII",
    place: { es: "Salamanca", pt: "Salamanca" },
    note: { es: "IUCE, Universidad de Salamanca", pt: "IUCE, Universidade de Salamanca" },
    current: true,
  },
];

/** Web permanente de la serie (IPB) y página de actas de ediciones anteriores. */
export const IETIC_SERIE = {
  web: "https://ietic.unipb.pt/",
  actas: "https://ietic.unipb.pt/edicoes-anteriores/",
};
