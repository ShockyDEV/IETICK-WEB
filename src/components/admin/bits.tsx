import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SESSION_TYPE_META, type SessionTypeKey } from "@/lib/session-types";
import { Badge } from "@/components/admin/ui";

/**
 * Piezas pequeñas del panel sin estado: cabecera de página, chip del tipo de
 * sesión (con su color de SESSION_TYPE_META) y estado de una sesión.
 */

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="antetitulo mb-1">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold sm:text-[1.75rem]">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-tinta-suave">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function SessionTypeChip({ type, className }: { type: SessionTypeKey; className?: string }) {
  const meta = SESSION_TYPE_META[type];
  const color = meta?.color ?? "#56656C";
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
      style={{ color, backgroundColor: `${color}14`, boxShadow: `inset 0 0 0 1px ${color}40` }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      <span className="truncate">{meta?.label.es ?? type}</span>
    </span>
  );
}

export function SessionStatus({ published, cancelled }: { published: boolean; cancelled: boolean }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {cancelled ? <Badge tone="danger">Cancelada</Badge> : null}
      {published ? (
        cancelled ? null : <Badge tone="success">Publicada</Badge>
      ) : (
        <Badge tone="warning">Borrador</Badge>
      )}
    </span>
  );
}
