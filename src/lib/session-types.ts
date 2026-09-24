import type { L10n } from "@/lib/i18n";

/**
 * Tipos de sesión del programa: etiqueta ES/PT y color. Los colores cumplen
 * contraste AA como texto sobre blanco (≥ 4,5:1) y se usan también, con
 * transparencia, como fondo de las tarjetas de la parrilla.
 */
export const SESSION_TYPES = [
  "ACREDITACION",
  "INSTITUCIONAL",
  "PONENCIA",
  "PANEL_EXPERTOS",
  "MESA_REDONDA",
  "TALLER",
  "COMUNICACIONES",
  "PROYECTOS",
  "PAUSA",
  "SOCIAL",
  "OTRO",
] as const;

export type SessionTypeKey = (typeof SESSION_TYPES)[number];

export const SESSION_TYPE_META: Record<
  SessionTypeKey,
  { label: L10n; plural: L10n; color: string }
> = {
  ACREDITACION: {
    label: { es: "Acreditaciones", pt: "Acreditação" },
    plural: { es: "Acreditaciones", pt: "Acreditação" },
    color: "#4D6470",
  },
  INSTITUCIONAL: {
    label: { es: "Acto institucional", pt: "Sessão institucional" },
    plural: { es: "Actos institucionales", pt: "Sessões institucionais" },
    color: "#8F5E12",
  },
  PONENCIA: {
    label: { es: "Ponencia invitada", pt: "Conferência convidada" },
    plural: { es: "Ponencias invitadas", pt: "Conferências convidadas" },
    color: "#135E77",
  },
  PANEL_EXPERTOS: {
    label: { es: "Panel de expertos", pt: "Painel de especialistas" },
    plural: { es: "Paneles de expertos", pt: "Painéis de especialistas" },
    color: "#3D4E9E",
  },
  MESA_REDONDA: {
    label: { es: "Mesa redonda", pt: "Mesa-redonda" },
    plural: { es: "Mesas redondas", pt: "Mesas-redondas" },
    color: "#6B4A9A",
  },
  TALLER: {
    label: { es: "Taller", pt: "Oficina" },
    plural: { es: "Talleres", pt: "Oficinas" },
    color: "#2E7050",
  },
  COMUNICACIONES: {
    label: { es: "Comunicaciones", pt: "Comunicações" },
    plural: { es: "Comunicaciones", pt: "Comunicações" },
    color: "#1F6FA8",
  },
  PROYECTOS: {
    label: { es: "Proyectos de investigación", pt: "Projetos de investigação" },
    plural: { es: "Proyectos de investigación", pt: "Projetos de investigação" },
    color: "#A23A6B",
  },
  PAUSA: {
    label: { es: "Pausa", pt: "Pausa" },
    plural: { es: "Pausas", pt: "Pausas" },
    color: "#5F6E75",
  },
  SOCIAL: {
    label: { es: "Actividad social", pt: "Atividade social" },
    plural: { es: "Actividades sociales", pt: "Atividades sociais" },
    color: "#94560F",
  },
  OTRO: {
    label: { es: "Otro", pt: "Outro" },
    plural: { es: "Otros", pt: "Outros" },
    color: "#56656C",
  },
};

/** Tipos que se pintan como franja a lo ancho (sin tarjeta clicable si no hay detalle). */
export const LOGISTIC_TYPES: SessionTypeKey[] = ["ACREDITACION", "PAUSA"];
