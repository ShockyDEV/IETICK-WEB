import type { L10n } from "@/lib/i18n";

/**
 * Navegación principal (mismas rutas en los dos idiomas; PT con prefijo /pt).
 *
 * Cada sección tiene su color, como en DIGIFOLK: lo toman el punto y la
 * estela del menú, el filete de la cabecera y la cabecera de su página. Son
 * tonos claros porque se pintan sobre el azul noche (contraste > 7:1).
 */
export const NAV: { path: string; label: L10n; color: string }[] = [
  { path: "/congreso", label: { es: "El congreso", pt: "O congresso" }, color: "#98DDED" },
  { path: "/programa", label: { es: "Programa", pt: "Programa" }, color: "#F0C263" },
  { path: "/ponentes", label: { es: "Ponentes", pt: "Oradores" }, color: "#C3A6F2" },
  { path: "/comunicaciones", label: { es: "Comunicaciones", pt: "Comunicações" }, color: "#7CC8F2" },
  { path: "/inscripcion", label: { es: "Inscripción", pt: "Inscrição" }, color: "#8BDDB0" },
  { path: "/comites", label: { es: "Comités", pt: "Comissões" }, color: "#F4A6C6" },
  { path: "/sede", label: { es: "Sede", pt: "Local" }, color: "#F5B387" },
];

/** Color de la sección de una ruta ("/sede", "/sede#como-llegar"…); cian en portada y legales. */
export function sectionColor(path: string): string {
  const clean = path.split(/[?#]/)[0];
  return NAV.find((n) => clean === n.path || clean.startsWith(`${n.path}/`))?.color ?? "#98DDED";
}

export const LEGAL_NAV: { path: string; label: L10n }[] = [
  { path: "/aviso-legal", label: { es: "Aviso legal", pt: "Aviso legal" } },
  { path: "/privacidad", label: { es: "Privacidad", pt: "Privacidade" } },
  { path: "/accesibilidad", label: { es: "Accesibilidad", pt: "Acessibilidade" } },
];

/** Textos de interfaz compartidos. */
export const UI = {
  skip: { es: "Saltar al contenido", pt: "Saltar para o conteúdo" },
  menu: { es: "Menú", pt: "Menu" },
  close: { es: "Cerrar", pt: "Fechar" },
  home: { es: "Inicio", pt: "Início" },
  mainNav: { es: "Navegación principal", pt: "Navegação principal" },
  language: { es: "Idioma", pt: "Idioma" },
  switchTo: { es: "Ver en portugués", pt: "Ver em espanhol" },
  pending: { es: "Por anunciar", pt: "A anunciar" },
  soon: { es: "Próximamente", pt: "Brevemente" },
  seeProgramme: { es: "Ver el programa", pt: "Ver o programa" },
  submit: { es: "Envía tu comunicación", pt: "Envia a tua comunicação" },
  organiza: { es: "Organización y colaboración", pt: "Organização e colaboração" },
  footerAbout: {
    es: "Conferencia ibérica que reúne a docentes, investigadores y profesionales de la educación de España y Portugal en torno a la innovación educativa con tecnologías.",
    pt: "Conferência ibérica que reúne docentes, investigadores e profissionais da educação de Espanha e Portugal em torno da inovação educativa com tecnologias.",
  },
  venueTitle: { es: "Sede", pt: "Local" },
  sections: { es: "Secciones", pt: "Secções" },
  howToGet: { es: "Cómo llegar", pt: "Como chegar" },
  rights: { es: "Universidad de Salamanca", pt: "Universidade de Salamanca" },
  contactSecretaria: { es: "Secretaría del congreso", pt: "Secretariado do congresso" },
} satisfies Record<string, L10n>;
