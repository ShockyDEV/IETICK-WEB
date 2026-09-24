import { notFound } from "next/navigation";

/** Cualquier otra ruta bajo /backstage → 404 del panel (dentro de su estructura). */
export default function UnknownPanelRoute() {
  notFound();
}
