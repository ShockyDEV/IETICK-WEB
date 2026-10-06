import Link from "next/link";
import { BASE_PATH, withBase } from "@/lib/base-path";

type Props = {
  href: string;
  className?: string;
  "aria-label"?: string;
  children: React.ReactNode;
};

/**
 * Enlace a una portada. En la subcarpeta de GitHub Pages (sin dominio propio)
 * la portada en español va con un <a> normal: <Link> pediría su contenido en
 * /IETICK-WEB.txt, fuera de la carpeta del proyecto, y daría un 404 en cada
 * página. Con dominio propio o en modo servidor es un <Link> de siempre.
 */
export function HomeLink({ href, children, ...rest }: Props) {
  if (BASE_PATH && href === "/") {
    return (
      <a href={withBase("/")} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
