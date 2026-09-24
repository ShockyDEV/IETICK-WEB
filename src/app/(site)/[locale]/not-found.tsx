import Link from "next/link";

/** 404 bilingüe (not-found no recibe el idioma de la ruta). */
export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-noche-900 text-white">
      <div className="contenedor flex min-h-[60vh] flex-col justify-center py-24">
        <p className="antetitulo-claro">Error 404</p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-white sm:text-5xl">
          Esta página no existe
          <span className="mt-2 block text-2xl font-semibold text-cian-300 sm:text-3xl">Esta página não existe</span>
        </h1>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="boton-oro">Volver al inicio</Link>
          <Link href="/pt" className="boton-contorno-claro">Voltar ao início</Link>
        </div>
      </div>
    </section>
  );
}
