import type { L10n } from "@/lib/i18n";

/** Navegación principal (mismas rutas en los dos idiomas; PT con prefijo /pt). */
export const NAV: { path: string; label: L10n }[] = [
  { path: "/congreso", label: { es: "El congreso", pt: "O congresso" } },
  { path: "/programa", label: { es: "Programa", pt: "Programa" } },
  { path: "/ponentes", label: { es: "Ponentes", pt: "Oradores" } },
  { path: "/comunicaciones", label: { es: "Comunicaciones", pt: "Comunicações" } },
  { path: "/inscripcion", label: { es: "Inscripción", pt: "Inscrição" } },
  { path: "/comites", label: { es: "Comités", pt: "Comissões" } },
  { path: "/sede", label: { es: "Sede", pt: "Local" } },
];

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
  organiza: { es: "Organiza", pt: "Organização" },
  footerAbout: {
    es: "Conferencia ibérica que reúne a docentes, investigadores y profesionales de la educación de España y Portugal en torno a la innovación educativa con tecnologías.",
    pt: "Conferência ibérica que reúne docentes, investigadores e profissionais da educação de Espanha e Portugal em torno da inovação educativa com tecnologias.",
  },
  venueTitle: { es: "Sede", pt: "Local" },
  sections: { es: "Secciones", pt: "Secções" },
  contact: { es: "Contacto de la sede", pt: "Contacto do local" },
  howToGet: { es: "Cómo llegar", pt: "Como chegar" },
  rights: { es: "Universidad de Salamanca", pt: "Universidade de Salamanca" },
} satisfies Record<string, L10n>;
