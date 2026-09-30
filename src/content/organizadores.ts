import type { L10n } from "@/lib/i18n";

/**
 * Entidades organizadoras de ieTIC 2027: zip «Logos» de la organización
 * (carpeta «Logos Organizadores», 30-09-2026). Los logos se han preparado
 * para la web con fondo transparente y recortados al contenido
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
}

export const ORGANIZADORES: Organizador[] = [
  {
    id: "usal",
    name: { es: "Universidad de Salamanca", pt: "Universidade de Salamanca" },
    url: "https://www.usal.es",
    logo: "/logos/organizadores/usal.png",
    width: 115,
    height: 88,
    h: 66,
  },
  {
    id: "ipb",
    name: {
      es: "Escola Superior de Educação, Instituto Politécnico de Bragança",
      pt: "Escola Superior de Educação, Instituto Politécnico de Bragança",
    },
    url: "https://ese.ipb.pt",
    logo: "/logos/organizadores/ipb.png",
    width: 198,
    height: 58,
    h: 42,
  },
  {
    id: "ucm",
    name: { es: "Universidad Complutense de Madrid", pt: "Universidade Complutense de Madrid" },
    url: "https://www.ucm.es",
    logo: "/logos/organizadores/ucm.png",
    width: 177,
    height: 49,
    h: 40,
  },
  {
    id: "uab",
    name: { es: "Universidade Aberta", pt: "Universidade Aberta" },
    url: "https://portal.uab.pt",
    logo: "/logos/organizadores/uab.png",
    width: 200,
    height: 55,
    h: 40,
  },
  {
    id: "edudig",
    name: {
      es: "EduDIG, Grupo de Investigación en Innovación y Educación Digital (Universidad de Salamanca)",
      pt: "EduDIG, Grupo de Investigação em Inovação e Educação Digital (Universidade de Salamanca)",
    },
    url: "https://edudig.usal.es",
    logo: "/logos/organizadores/edudig.png",
    width: 462,
    height: 184,
    h: 48,
  },
  {
    id: "mita",
    name: {
      es: "MITA, Grupo de Investigación en Multiculturalidad, Innovación y Tecnologías Aplicadas (Universidad de Salamanca)",
      pt: "MITA, Grupo de Investigação em Multiculturalidade, Inovação e Tecnologias Aplicadas (Universidade de Salamanca)",
    },
    url: "https://diarium.usal.es/mita/",
    logo: "/logos/organizadores/mita.png",
    width: 855,
    height: 256,
    h: 42,
  },
];
