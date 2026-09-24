import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Primitivas de interfaz del panel (sin estado: valen en componentes de
 * servidor y de cliente). Estética de herramienta de trabajo: clara, densa,
 * tarjetas blancas con borde `linea`, acento `mar-600`.
 */

// ─── Botones ──────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost" | "dark";
export type ButtonSize = "sm" | "md" | "icon" | "icon-sm";

const BUTTON_BASE =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium transition " +
  "disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-oro-400 focus-visible:ring-offset-2";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-mar-600 text-white shadow-sm hover:bg-mar-700 active:bg-mar-800",
  secondary: "border border-linea bg-white text-tinta shadow-sm hover:border-mar-300 hover:text-mar-700",
  ghost: "text-tinta-suave hover:bg-mar-50 hover:text-mar-700",
  danger: "bg-red-700 text-white shadow-sm hover:bg-red-800",
  "danger-ghost": "text-red-700 hover:bg-red-50 hover:text-red-800",
  dark: "bg-white/10 text-white hover:bg-white/15",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-2.5 text-xs",
  md: "h-9 px-3.5 text-sm",
  icon: "h-9 w-9",
  "icon-sm": "h-8 w-8",
};

export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md", className?: string) {
  return cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Muestra un indicador de carga y desactiva el botón. */
  busy?: boolean;
}

export function Button({
  variant = "secondary",
  size = "md",
  busy = false,
  type = "button",
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={buttonClass(variant, size, className)}
      {...props}
    >
      {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

// ─── Campos de formulario ─────────────────────────────────────────────

export const inputClass =
  "block w-full rounded-lg border border-linea bg-white px-3 py-2 text-sm text-tinta shadow-sm transition " +
  "placeholder:text-tinta-tenue/60 hover:border-mar-200 " +
  "focus:border-mar-500 focus:outline-none focus:ring-2 focus:ring-mar-500/25 focus:ring-offset-0 " +
  "disabled:cursor-not-allowed disabled:bg-papel disabled:text-tinta-tenue " +
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/25";

export const selectClass = cn(inputClass, "pr-8");
export const textareaClass = cn(inputClass, "min-h-[5rem] leading-relaxed");

/** Atributos ARIA de un control con pista y/o error. */
export function describedBy(id: string, { hint, error }: { hint?: ReactNode; error?: string | null }) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return {
    id,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": ids.length ? ids.join(" ") : undefined,
  };
}

interface FieldProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  /** Texto a la derecha de la etiqueta (p. ej. un contador). */
  aside?: ReactNode;
  children: ReactNode;
}

/** Etiqueta + control + pista + error. El control debe usar `describedBy(id, …)`. */
export function Field({ id, label, hint, error, required, className, aside, children }: FieldProps) {
  return (
    <div className={className}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-tinta">
          {label}
          {required ? (
            <span className="ml-0.5 text-red-700" aria-hidden="true">
              *
            </span>
          ) : null}
          {required ? <span className="sr-only"> (obligatorio)</span> : null}
        </label>
        {aside ? <span className="text-xs text-tinta-tenue">{aside}</span> : null}
      </div>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-tinta-tenue">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface CheckboxProps {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ id, label, description, checked, onChange, disabled, className }: CheckboxProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={description ? `${id}-desc` : undefined}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-linea accent-mar-600 disabled:cursor-not-allowed"
      />
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-tinta">
          {label}
        </label>
        {description ? (
          <p id={`${id}-desc`} className="text-xs text-tinta-tenue">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Nombre accesible (obligatorio: el interruptor no tiene texto visible). */
  label: string;
  disabled?: boolean;
  busy?: boolean;
}

/** Interruptor accesible (role="switch"). */
export function Switch({ checked, onChange, label, disabled, busy }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled || busy}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-mar-600" : "bg-tinta-tenue/40",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition",
          checked ? "translate-x-[1.125rem]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

// ─── Contenedores y etiquetas ─────────────────────────────────────────

interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Id del título (para `aria-labelledby`). */
  titleId?: string;
  className?: string;
  bodyClassName?: string;
  id?: string;
  children: ReactNode;
}

export function Card({ title, description, actions, titleId, className, bodyClassName, id, children }: CardProps) {
  return (
    <section
      id={id}
      aria-labelledby={title && titleId ? titleId : undefined}
      className={cn("rounded-xl border border-linea bg-white shadow-sm", className)}
    >
      {title || actions ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-linea px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title ? (
              <h2 id={titleId} className="font-sans text-sm font-semibold tracking-normal text-tinta">
                {title}
              </h2>
            ) : null}
            {description ? <p className="mt-0.5 text-xs text-tinta-tenue">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "dark";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-papel text-tinta-suave ring-linea",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  warning: "bg-amber-50 text-amber-900 ring-amber-200",
  danger: "bg-red-50 text-red-800 ring-red-200",
  info: "bg-mar-50 text-mar-800 ring-mar-100",
  dark: "bg-noche-800 text-white ring-noche-700",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      {icon ? <div className="text-mar-400">{icon}</div> : null}
      <p className="text-sm font-semibold text-tinta">{title}</p>
      {children ? <div className="max-w-md text-sm text-tinta-suave">{children}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Clave legible (ids, fechas): monoespaciada y discreta. */
export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-papel px-1.5 py-0.5 font-mono text-[0.75rem] text-tinta-suave ring-1 ring-inset ring-linea">
      {children}
    </code>
  );
}
