import { HeroArt } from "@/components/art/HeroArt";

/** Ilustración del hero de portada: Salamanca de noche (skyline SVG animado). */
export function HomeHeroArt() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      <HeroArt />
    </div>
  );
}
