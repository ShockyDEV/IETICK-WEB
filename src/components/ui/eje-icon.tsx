import { Accessibility, BookOpenText, BrainCircuit, FlaskConical, Gamepad2, HeartHandshake } from "lucide-react";
import type { Eje } from "@/content/ejes";

const ICONS = {
  rea: BookOpenText,
  ciencia: FlaskConical,
  bienestar: HeartHandshake,
  inclusion: Accessibility,
  gamificacion: Gamepad2,
  ia: BrainCircuit,
} as const;

export function EjeIcon({ icon, className }: { icon: Eje["icon"]; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon className={className} aria-hidden strokeWidth={1.6} />;
}
