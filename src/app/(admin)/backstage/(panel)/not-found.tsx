import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonClass } from "@/components/admin/ui";

/** 404 dentro del panel (sesión inexistente, ruta desconocida…). */
export default function PanelNotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-linea bg-white p-6 text-center shadow-sm">
      <SearchX className="mx-auto h-8 w-8 text-mar-400" aria-hidden="true" />
      <h1 className="mt-3 font-sans text-lg font-semibold tracking-normal">No se ha encontrado</h1>
      <p className="mt-1 text-sm text-tinta-suave">
        La página o el elemento que buscas no existe o se ha borrado.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/backstage/programa" className={buttonClass("primary")}>
          Ir al programa
        </Link>
        <Link href="/backstage" className={buttonClass("secondary")}>
          Ir al resumen
        </Link>
      </div>
    </div>
  );
}
