"use client";

import { ErrorState } from "@/components/admin/ErrorState";

/** Errores de la estructura del panel (p. ej. la BD no responde al comprobar la sesión). */
export default function BackstageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-papel px-4">
      <ErrorState error={error} reset={reset} />
    </div>
  );
}
