import Image from "next/image";
import { ORGANIZADORES } from "@/content/organizadores";
import { pick, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

/**
 * Logos de las entidades organizadoras, en color y sobre fondo claro (así se
 * respetan los colores institucionales). Cada uno enlaza a su web. Van en el
 * pie de todas las páginas. En pantallas anchas se reparten en dos filas
 * iguales (un salto forzado a mitad de la lista) para que ningún logo se
 * quede solo en una tercera fila.
 */
export function OrganizersBand({ locale, className }: { locale: Locale; className?: string }) {
  const half = Math.ceil(ORGANIZADORES.length / 2);
  return (
    <ul className={cn("flex flex-wrap items-center justify-center gap-x-10 gap-y-7", className)}>
      {ORGANIZADORES.flatMap((o, i) => {
        const name = pick(o.name, locale);
        const item = (
          <li key={o.id}>
            <a
              href={o.url}
              target="_blank"
              rel="noopener noreferrer"
              title={name}
              className="block rounded-sm transition duration-300 hover:-translate-y-0.5"
            >
              <Image
                src={o.logo}
                alt={name}
                width={o.width}
                height={o.height}
                style={{ ["--h" as string]: `${o.h}px` }}
                className="h-[calc(var(--h)*0.8)] w-auto sm:h-[var(--h)]"
              />
            </a>
          </li>
        );
        return i === half - 1 ? [item, <li key="salto" className="hidden basis-full xl:block" aria-hidden />] : [item];
      })}
    </ul>
  );
}
