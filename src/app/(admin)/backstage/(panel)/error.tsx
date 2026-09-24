"use client";

import { ErrorState } from "@/components/admin/ErrorState";

/** Errores de las páginas del panel (se pintan dentro de la estructura del panel). */
export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} />;
}
