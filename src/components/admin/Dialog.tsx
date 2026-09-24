"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/admin/ui";

/**
 * Diálogo modal accesible sobre <dialog> nativo (showModal): el resto de la
 * página queda inerte, Esc cierra, `aria-labelledby`/`aria-describedby`
 * apuntan al título y la descripción. Al abrir, el foco va al primer
 * elemento con `data-autofocus` (o al primer campo) y al cerrar vuelve al
 * elemento que lo tenía.
 */
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Mientras es true no se puede cerrar (p. ej. guardando). */
  busy?: boolean;
}

const SIZES = {
  sm: "w-[min(calc(100vw-2rem),28rem)]",
  md: "w-[min(calc(100vw-2rem),40rem)]",
  lg: "w-[min(calc(100vw-2rem),52rem)]",
};

export function Dialog({ open, onClose, title, description, children, footer, size = "md", busy }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const previous = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    const target =
      dialog.querySelector<HTMLElement>("[data-autofocus]") ??
      dialog.querySelector<HTMLElement>("input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled])");
    target?.focus();
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = overflow;
      if (dialog.open) dialog.close();
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(e) => {
        // Esc: el estado lo gobierna el padre
        e.preventDefault();
        if (!busy) onClose();
      }}
      className={cn(
        "m-auto max-h-[calc(100dvh-2rem)] overflow-hidden rounded-xl border border-linea bg-white p-0 text-tinta shadow-elevada",
        "backdrop:bg-noche-950/60 backdrop:backdrop-blur-[2px]",
        SIZES[size],
      )}
    >
      {open ? (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-linea px-5 py-4">
            <div className="min-w-0">
              <h2 id={titleId} className="font-sans text-base font-semibold tracking-normal text-tinta">
                {title}
              </h2>
              {description ? (
                <div id={descriptionId} className="mt-1 text-sm text-tinta-suave">
                  {description}
                </div>
              ) : null}
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose} disabled={busy} aria-label="Cerrar">
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </header>
          {children ? <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div> : null}
          {footer ? (
            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-linea bg-papel/70 px-5 py-3">
              {footer}
            </footer>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  /** Si devuelve una promesa, el diálogo espera (y muestra «ocupado») hasta que termine. */
  onConfirm: () => unknown | Promise<unknown>;
  onClose: () => void;
}

/** Confirmación (borrar, desactivar…). El foco inicial va a «Cancelar». */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirmar",
  tone = "danger",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      busy={busy}
      footer={
        <>
          <Button onClick={onClose} disabled={busy} data-autofocus>
            Cancelar
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} busy={busy} onClick={confirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children ? <div className="space-y-2 text-sm text-tinta-suave">{children}</div> : null}
    </Dialog>
  );
}
