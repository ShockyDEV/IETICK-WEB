"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/cn";
import { apiRequest, errorMessage } from "@/lib/admin/api-client";
import type { ProgrammeStatus } from "@/lib/admin/types";

const OPTIONS: { value: ProgrammeStatus; label: string; hint: string }[] = [
  { value: "provisional", label: "Provisional", hint: "La web avisa de que el programa puede cambiar." },
  { value: "definitivo", label: "Definitivo", hint: "La web presenta el programa como cerrado." },
];

/** Conmutador del estado del programa (Setting `programmeStatus`). */
export function ProgrammeStatusToggle({ status }: { status: ProgrammeStatus }) {
  const router = useRouter();
  const [current, setCurrent] = useState<ProgrammeStatus>(status);
  const [busy, setBusy] = useState(false);

  useEffect(() => setCurrent(status), [status]);

  async function change(next: ProgrammeStatus) {
    if (next === current || busy) return;
    setBusy(true);
    try {
      await apiRequest("/api/admin/settings", { method: "PUT", body: { programmeStatus: next } });
      setCurrent(next);
      toast.success(next === "definitivo" ? "El programa figura ahora como definitivo." : "El programa figura ahora como provisional.");
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const active = OPTIONS.find((o) => o.value === current) ?? OPTIONS[0];

  return (
    <div>
      <div role="group" aria-label="Estado del programa" className="inline-flex rounded-lg border border-linea bg-papel p-1">
        {OPTIONS.map((option) => {
          const selected = option.value === current;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              disabled={busy}
              onClick={() => change(option.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-wait",
                selected
                  ? option.value === "definitivo"
                    ? "bg-mar-600 text-white shadow-sm"
                    : "bg-white text-oro-800 shadow-sm ring-1 ring-oro-200"
                  : "text-tinta-suave hover:text-tinta",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-tinta-tenue" aria-live="polite">
        {active.hint}
      </p>
    </div>
  );
}
