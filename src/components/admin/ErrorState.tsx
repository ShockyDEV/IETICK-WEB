"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button, buttonClass } from "@/components/admin/ui";

/** Error inesperado en una página del panel (lo usan los error.tsx). */
export function ErrorState({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm" role="alert">
      <TriangleAlert className="mx-auto h-8 w-8 text-red-600" aria-hidden="true" />
      <h1 className="mt-3 font-sans text-lg font-semibold tracking-normal">Algo ha fallado</h1>
      <p className="mt-1 text-sm text-tinta-suave">
        No se ha podido cargar esta página. Puede que la base de datos no esté disponible en este momento.
      </p>
      {error.digest ? <p className="mt-2 font-mono text-xs text-tinta-tenue">Referencia: {error.digest}</p> : null}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button variant="primary" onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reintentar
        </Button>
        <Link href="/backstage" className={buttonClass("secondary")}>
          Ir al resumen
        </Link>
      </div>
    </div>
  );
}
