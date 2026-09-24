import type { L10n } from "@/lib/i18n";

/**
 * Alojamientos recomendados (como la sección «Alojamiento» de JUTE 2026).
 * Vacío hasta que la organización cierre acuerdos: mientras tanto la página
 * de Sede muestra «Próximamente». Basta con añadir entradas aquí.
 */
export interface Hotel {
  name: string;
  stars?: number;
  address: string;
  web?: string;
  phone?: string;
  email?: string;
  /** Distancia o tiempo a pie hasta la sede, p. ej. «12 min a pie» */
  distance?: L10n;
  /** Condiciones para congresistas (código, descuento, fechas) */
  offer?: L10n;
}

export const HOTELES: Hotel[] = [];
