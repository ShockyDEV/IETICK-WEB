import type { L10n } from "@/lib/i18n";

/**
 * Comités de ieTIC 2027, según «COMITÉS_ieTIC27 definitivo.xlsx» (organización,
 * 06-10-2026; copia en ../material-organizacion/comites-2026-10-06/).
 *
 * Los correos de la hoja NO se copian: son datos personales y el repositorio es
 * público. Nombres y afiliaciones van tal cual; solo se han normalizado los
 * espacios y dos afiliaciones («Universidades Politécnica de Bragança» →
 * «Universidade», y el «, Portugal» repetido de «Universidade Técnica do Porto»).
 */

export interface MiembroComite {
  name: string;
  affiliation: string;
}

export type PaisId = "es" | "pt" | "br" | "mx" | "ar" | "cl" | "ec";

export interface MiembroCientifico extends MiembroComite {
  country: PaisId;
}

export const PAISES: Record<PaisId, L10n> = {
  es: { es: "España", pt: "Espanha" },
  pt: { es: "Portugal", pt: "Portugal" },
  br: { es: "Brasil", pt: "Brasil" },
  mx: { es: "México", pt: "México" },
  ar: { es: "Argentina", pt: "Argentina" },
  cl: { es: "Chile", pt: "Chile" },
  ec: { es: "Ecuador", pt: "Equador" },
};

/** En el orden de la hoja. */
export const COMITE_ORGANIZADOR: MiembroComite[] = [
  { name: "Ana García-Valcárcel Muñoz-Repiso", affiliation: "Universidad de Salamanca" },
  { name: "Vitor Gonçalves", affiliation: "Universidade Politécnica de Bragança" },
  { name: "José António Moreira", affiliation: "Universidade Aberta do Porto" },
  { name: "Pilar Gutiez Cuevas", affiliation: "Universidad Complutense de Madrid" },
  { name: "Cristina Sánchez Romero", affiliation: "UNED" },
  { name: "Sonia Casillas-Martín", affiliation: "Universidad de Salamanca" },
  { name: "Marcos Cabezas-González", affiliation: "Universidad de Salamanca" },
  { name: "Erla Mariela Morales Morgado", affiliation: "Universidad de Salamanca" },
  { name: "Sonia Nuño Sánchez", affiliation: "Universidad de Salamanca" },
  { name: "Amanda Sánchez García", affiliation: "Universidad de Salamanca" },
  { name: "Celia Sánchez Peinado", affiliation: "Universidad de Salamanca" },
  { name: "César Daniel Pascual Vallejo", affiliation: "Universidad de Salamanca" },
  { name: "David Rodríguez Muelas", affiliation: "Universidad de Salamanca" },
  { name: "Enrique González Gutiérrez", affiliation: "Universidad de Salamanca" },
];

/** En el orden de la hoja; la página los agrupa por país y los ordena por nombre. */
export const COMITE_CIENTIFICO: MiembroCientifico[] = [
  { name: "Antonio Robles Gómez", affiliation: "UNED", country: "es" },
  { name: "Agustín Carlos Caminero", affiliation: "UNED", country: "es" },
  { name: "Alién García Hernández", affiliation: "Universidad Tecnológica Atlántico-Mediterráneo", country: "es" },
  { name: "Ana García-Valcárcel Muñoz-Repiso", affiliation: "Universidad de Salamanca", country: "es" },
  { name: "Ana María de las Heras Cuenca", affiliation: "Universidad Complutense de Madrid", country: "es" },
  { name: "Ana Mouraz Lopes", affiliation: "Universidade Aberta", country: "pt" },
  { name: "Ana Machado", affiliation: "Universidade Portucalense", country: "pt" },
  { name: "Ana Vega", affiliation: "Universidad de La Laguna", country: "es" },
  { name: "Angélica Monteiro", affiliation: "Universidade do Porto", country: "pt" },
  { name: "António Abreu", affiliation: "Universidade Técnica do Porto", country: "pt" },
  { name: "Antonio Vicente Rodríguez Fuentes", affiliation: "Universidad de Granada", country: "es" },
  { name: "Armando Sérgio de Aguiar Filho", affiliation: "Universidade FUMEC", country: "br" },
  { name: "Blanca Aurelia Valenzuela", affiliation: "Universidad de Sonora", country: "mx" },
  { name: "Bruno Miguel Ferreira Gonçalves", affiliation: "Universidade Politécnica de Bragança", country: "pt" },
  { name: "Carlos Barroso Moreno", affiliation: "Universidad Complutense de Madrid", country: "es" },
  { name: "Carlos Monge López", affiliation: "UNED", country: "es" },
  { name: "Cristina Maria Mesquita", affiliation: "Universidade Politécnica de Bragança", country: "pt" },
  { name: "Cristina Sánchez Romero", affiliation: "UNED", country: "es" },
  { name: "Cristina Pereira Vieira", affiliation: "Universidade Aberta", country: "pt" },
  { name: "Daniela Barros", affiliation: "Universidade Aberta", country: "pt" },
  { name: "Elena Bañares Marivela", affiliation: "Universidad Politécnica de Madrid", country: "es" },
  { name: "Eliana Ishikawa", affiliation: "Universidade Tecnológica Federal do Paraná - Campus Ponta Grossa", country: "br" },
  { name: "Eliane Schlemmer", affiliation: "Universidade do Vale do Rio dos Sinos – UNISINOS", country: "br" },
  { name: "Eloiza Aparecida Silva Avila de Matos", affiliation: "Universidade Tecnológica Federal do Paraná - Campus Ponta Grossa", country: "br" },
  { name: "Erla Mariela Morales Morgado", affiliation: "Universidad de Salamanca", country: "es" },
  { name: "Eusébio Costa", affiliation: "Instituto Europeu de Estudos Superiores", country: "pt" },
  { name: "Eva María Muñoz Jiménez", affiliation: "UNED", country: "es" },
  { name: "Fábio Gomes Rocha", affiliation: "Universidade Federal de Sergipe", country: "br" },
  { name: "Fátima Llamas Salguero", affiliation: "Universidad de Extremadura", country: "es" },
  { name: "Fco. Javier Del Pino Gutiérrez", affiliation: "Universidad de León", country: "es" },
  { name: "Feliciano Castaño Villar", affiliation: "Universidad de Granada", country: "es" },
  { name: "Fernando Fraga Varela", affiliation: "Universidad de Santiago de Compostela", country: "es" },
  { name: "Francisco Crespo Molero", affiliation: "UNED", country: "es" },
  { name: "Javier Gil Quintana", affiliation: "UNED", country: "es" },
  { name: "José Hernández Ortega", affiliation: "Universidad Complutense de Madrid", country: "es" },
  { name: "Henrique Teixeira Gil", affiliation: "Universidade Politécnica de Castelo Branco", country: "pt" },
  { name: "Iasmin Zanchi Boueri", affiliation: "Universidade Federal do Paraná", country: "br" },
  { name: "Ilka Serra", affiliation: "Universidade do Estado do Maranhão", country: "br" },
  { name: "Isabel Augusta Chumbo", affiliation: "Universidade Politécnica de Bragança", country: "pt" },
  { name: "Jesús Valverde Berrocoso", affiliation: "Universidad de Extremadura", country: "es" },
  { name: "José Antonio Torres González", affiliation: "Universidad de Jaén", country: "es" },
  { name: "José Juán Carrión Martínez", affiliation: "Universidad de Almería", country: "es" },
  { name: "José M. Gutiérrez Pequeño", affiliation: "Universidad de Valladolid", country: "es" },
  { name: "Jose Miguel Correa Gorospe", affiliation: "Universidad País Vasco", country: "es" },
  { name: "Juan Fco. Gavilán Escalona", affiliation: "Universidad de Concepción", country: "cl" },
  { name: "Julio César Leyva Ruiz", affiliation: "Universidad Michoacana de S. Nicolás", country: "mx" },
  { name: "Klaus Schlunzen Junior", affiliation: "Universidade Estadual Paulista", country: "br" },
  { name: "Leonel Morgado", affiliation: "Universidade Aberta", country: "pt" },
  { name: "María Jesús Márquez García", affiliation: "Universidad de Málaga", country: "es" },
  { name: "Maria de Fátima Goulão", affiliation: "Universidade Aberta", country: "pt" },
  { name: "María de los Llanos Tobarra Abad", affiliation: "UNED", country: "es" },
  { name: "María del Castellar López Guinea", affiliation: "Universidad Complutense de Madrid", country: "es" },
  { name: "María del Rosario Limón Mendiizaval", affiliation: "Universidad Complutense de Madrid", country: "es" },
  { name: "Manuela Guillén Lugigo", affiliation: "Universidad de Sonora", country: "mx" },
  { name: "Marcos Cabezas González", affiliation: "Universidad de Salamanca", country: "es" },
  { name: "María Carmen Martínez Serrano", affiliation: "Universidad de Jaén", country: "es" },
  { name: "María José Angélico Gonçalves", affiliation: "Universidade Técnica do Porto", country: "pt" },
  { name: "María Jesús Colmenero Ruíz", affiliation: "Universidad de Jaén", country: "es" },
  { name: "María Raquel Vaz Patrício", affiliation: "Universidade Politécnica de Bragança", country: "pt" },
  { name: "María Rosa Fernández Sánchez", affiliation: "Universidad de Extremadura", country: "es" },
  { name: "Maribel Miranda Pinto", affiliation: "Universidade Aberta", country: "pt" },
  { name: "Martha Vanessa Agila Palacios", affiliation: "UTPL Universidad Católica de Loja", country: "ec" },
  { name: "Mario Alberto Secchi", affiliation: "Instituto Universitario Italiano de Rosario", country: "ar" },
  { name: "Melchor Gómez García", affiliation: "Universidad Autónoma de Madrid", country: "es" },
  { name: "Miguel Romero Hortelano", affiliation: "UNED", country: "es" },
  { name: "Moussa Boumadan Hamed", affiliation: "UNED", country: "es" },
  { name: "Nicolas Rodriguez León", affiliation: "Instituto Universitario Italiano de Rosario", country: "ar" },
  { name: "Paloma Antón Ares", affiliation: "Universidad Complutense de Madrid", country: "es" },
  { name: "Patricia Gómez Hernández", affiliation: "UNED", country: "es" },
  { name: "Paulo Alexandre Alves", affiliation: "Universidade Politécnica de Bragança", country: "pt" },
  { name: "Paulo C. Dias", affiliation: "Universidade Católica Portuguesa", country: "pt" },
  { name: "Pedro F. Oliveira", affiliation: "Universidade Politécnica de Bragança", country: "pt" },
  { name: "Piedad Calvo León", affiliation: "Universidad de Málaga", country: "es" },
  { name: "Pilar Gutiez Cuevas", affiliation: "Universidad Complutense de Madrid", country: "es" },
  { name: "Rafael Pastor Vargas", affiliation: "UNED", country: "es" },
  { name: "Ramón Montes Rodríguez", affiliation: "Universidad de Granada", country: "es" },
  { name: "Raúl Eirin Nemiña", affiliation: "Universidad de Santiago de Compostela", country: "es" },
  { name: "Rocío Muñoz Mansilla", affiliation: "UNED", country: "es" },
  { name: "Roberto Soto Varela", affiliation: "Universidad Autónoma de Madrid", country: "es" },
  { name: "Rosa Eva Valle Florez", affiliation: "Universidad de León", country: "es" },
  { name: "Rosa Maenza", affiliation: "Universidad Tecnológica Nacional (UTN)", country: "ar" },
  { name: "Rosimeri Ferraz Sabino", affiliation: "Universidade Federal de Sergipe", country: "br" },
  { name: "Rui Pedro Lopes", affiliation: "Universidade Politécnica de Bragança", country: "pt" },
  { name: "Sabrina Fernandes de Castro", affiliation: "Universidade Federal de Santa Maria", country: "br" },
  { name: "Sara Dias Trindade", affiliation: "Universidade do Porto", country: "pt" },
  { name: "Sonia Casillas Martín", affiliation: "Universidad de Salamanca", country: "es" },
  { name: "Sonia Rodríguez Cano", affiliation: "Universidad de Burgos", country: "es" },
  { name: "Simone Ceolin", affiliation: "Universidade Federal de Santa Maria", country: "br" },
  { name: "Susana Henriques", affiliation: "Universidade Aberta", country: "pt" },
  { name: "Teresa González Ramírez", affiliation: "Universidad de Sevilla", country: "es" },
  { name: "Teresa Pessoa", affiliation: "Universidade de Coimbra", country: "pt" },
  { name: "Valentín Martínez-Otero Pérez", affiliation: "Universidad Complutense de Madrid", country: "es" },
  { name: "Vanesa Delgado Benito", affiliation: "Universidad de Burgos", country: "es" },
  { name: "Vitor Barrigão Gonçalves", affiliation: "Universidade Politécnica de Bragança", country: "pt" },
  { name: "Vitor Hugo B. Manzke", affiliation: "Instituto Federal de Río Grande do Sul", country: "br" },
];
