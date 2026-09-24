import { LoaderCircle } from "lucide-react";

/** Mientras se cargan los datos de una página del panel. */
export default function PanelLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status">
      <LoaderCircle className="h-6 w-6 animate-spin text-mar-500" aria-hidden="true" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
