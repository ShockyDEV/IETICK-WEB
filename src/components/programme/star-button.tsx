"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/** Estrella de «Mi agenda». Detiene la propagación para no abrir la tarjeta. */
export function StarButton({
  active,
  onToggle,
  label,
  className,
  size = "sm",
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onKeyDown={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition",
        size === "sm" ? "h-7 w-7" : "h-10 w-10",
        active ? "text-oro-500 hover:text-oro-600" : "text-tinta-tenue/70 hover:bg-black/5 hover:text-tinta",
        className,
      )}
    >
      <Star className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} fill={active ? "currentColor" : "none"} aria-hidden />
    </button>
  );
}
