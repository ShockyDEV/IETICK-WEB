import type { L10n } from "@/lib/i18n";

/**
 * Entidades que organizan y colaboran en ieTIC 2027: los logos del documento
 * «Información para la web de ieTIC 2027» (01-10-2026) más la UCM, que venía
 * en el zip «Logos» del 30-09 aunque el documento no la incluye (criterio del
 * usuario: mejor que sobre alguien a que falte). El documento no dice el
 * papel de cada logo; según su texto de presentación, organiza el consorcio
 * IPB/USAL/UAberta/UNED con la colaboración de la Asociación de Atención
 * Temprana AMPA (sin logo).
 *
 * Logos preparados para la web con fondo transparente y recortados
 * (public/logos/organizadores/); `h` es su alto en pantalla, calculado para
 * que todos pesen parecido a la vista pese a sus proporciones distintas.
 */
export interface Organizador {
  id: string;
  name: L10n;
  url: string;
  logo: string;
  /** Tamaño del fichero (px) */
  width: number;
  height: number;
  /** Alto de presentación (px) */
  h: number;
  /** Universidad del consorcio organizador (texto de presentación oficial) */
  consorcio?: boolean;
}

export const ORGANIZADORES: Organizador[] = [
  {
    id: "usal",
    name: { es: "Universidad de Salamanca", pt: "Universidade de Salamanca" },
    url: "https://www.usal.es",
    logo: "/logos/organizadores/usal.png",
    width: 541,
    height: 148,
    h: 38,
    consorcio: true,
  },
  {
    id: "ipb",
    name: { es: "Instituto Politécnico de Bragança", pt: "Instituto Politécnico de Bragança" },
    url: "https://www.ipb.pt",
    logo: "/logos/organizadores/ipb.png",
    width: 252,
    height: 182,
    h: 56,
    consorcio: true,
  },
  {
    id: "uab",
    name: { es: "Universidade Aberta", pt: "Universidade Aberta" },
    url: "https://portal.uab.pt",
    logo: "/logos/organizadores/uab.png",
    width: 478,
    height: 136,
    h: 39,
    consorcio: true,
  },
  {
    id: "uned",
    name: { es: "Universidad Nacional de Educación a Distancia (UNED)", pt: "Universidad Nacional de Educación a Distancia (UNED)" },
    url: "https://www.uned.es",
    logo: "/logos/organizadores/uned.png",
    width: 285,
    height: 108,
    h: 42,
    consorcio: true,
  },
  {
    id: "ucm",
    name: { es: "Universidad Complutense de Madrid", pt: "Universidade Complutense de Madrid" },
    url: "https://www.ucm.es",
    logo: "/logos/organizadores/ucm.png",
    width: 177,
    height: 49,
    h: 39,
  },
  {
    id: "educacion",
    name: { es: "Facultad de Educación, Universidad de Salamanca", pt: "Faculdade de Educação, Universidade de Salamanca" },
    url: "https://educacion.usal.es",
    logo: "/logos/organizadores/educacion.png",
    width: 968,
    height: 220,
    h: 35,
  },
  {
    id: "iuce",
    name: { es: "Instituto Universitario de Ciencias de la Educación (IUCE), Universidad de Salamanca", pt: "Instituto Universitário de Ciências da Educação (IUCE), Universidade de Salamanca" },
    url: "https://solis.usal.es",
    logo: "/logos/organizadores/iuce.png",
    width: 340,
    height: 156,
    h: 48,
  },
  {
    id: "formacion",
    name: { es: "Centro de Formación Permanente, Universidad de Salamanca", pt: "Centro de Formação Permanente, Universidade de Salamanca" },
    url: "https://formacionpermanente.usal.es",
    logo: "/logos/organizadores/formacion.png",
    width: 491,
    height: 155,
    h: 41,
  },
  {
    id: "iberoamerica",
    name: { es: "Instituto de Iberoamérica, Universidad de Salamanca", pt: "Instituto de Ibero-América, Universidade de Salamanca" },
    url: "https://iberoame.usal.es",
    logo: "/logos/organizadores/iberoamerica.png",
    width: 390,
    height: 74,
    h: 32,
  },
  {
    id: "edudig",
    name: { es: "EduDIG, Grupo de Investigación en Innovación y Educación Digital (Universidad de Salamanca)", pt: "EduDIG, Grupo de Investigação em Inovação e Educação Digital (Universidade de Salamanca)" },
    url: "https://edudig.usal.es",
    logo: "/logos/organizadores/edudig.png",
    width: 482,
    height: 186,
    h: 46,
  },
  {
    id: "mita",
    name: { es: "MITA, Grupo de Investigación en Multiculturalidad, Innovación y Tecnologías Aplicadas (Universidad de Salamanca)", pt: "MITA, Grupo de Investigação em Multiculturalidade, Inovação e Tecnologias Aplicadas (Universidade de Salamanca)" },
    url: "https://diarium.usal.es/mita/",
    logo: "/logos/organizadores/mita.png",
    width: 353,
    height: 107,
    h: 40,
  },
  {
    id: "centenario",
    name: { es: "V Centenario de la Escuela de Salamanca (1526–2026)", pt: "V Centenário da Escola de Salamanca (1526–2026)" },
    url: "https://escueladesalamanca.usal.es",
    logo: "/logos/organizadores/centenario.png",
    width: 1981,
    height: 220,
    h: 30,
  },
];
