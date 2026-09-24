import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { getCurrentAdmin } from "@/lib/admin/guard";
import { safeCallbackUrl } from "@/lib/admin/callback-url";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Acceso" };

/** Mensajes para los códigos `?error=` que puede traer la URL (Auth.js o el propio panel). */
const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Correo o contraseña incorrectos. Tras varios intentos fallidos hay que esperar unos minutos.",
  SessionRequired: "Tu sesión ha terminado o la cuenta está desactivada. Vuelve a entrar.",
  AccessDenied: "Esta cuenta no tiene acceso al panel.",
  Configuration: "El acceso no está disponible por un problema de configuración del servidor.",
};

type Props = {
  searchParams: Promise<{ callbackUrl?: string | string[]; error?: string | string[] }>;
};

export default async function AccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const callbackUrl = safeCallbackUrl(first(params.callbackUrl));

  // Con una sesión válida (y la cuenta activa) no tiene sentido volver a entrar
  if (await getCurrentAdmin()) redirect(callbackUrl);

  const code = first(params.error);
  const initialError = code ? ERROR_MESSAGES[code] ?? "No se ha podido iniciar sesión. Inténtalo de nuevo." : null;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-noche-900 px-4 py-10">
      {/* Fondo: halos suaves con los colores del logo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_15%_-10%,rgba(22,116,146,0.45),transparent_60%),radial-gradient(40rem_30rem_at_110%_110%,rgba(152,221,237,0.14),transparent_60%)]"
      />

      <main className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-display text-2xl font-bold tracking-tight text-white">ieTIC 2027</p>
          <p className="antetitulo-claro mt-1">Panel de administración</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-elevada sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mar-50 text-mar-600" aria-hidden="true">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-sans text-lg font-semibold tracking-normal">Acceso al panel</h1>
              <p className="text-sm text-tinta-tenue">Programa, espacios y ajustes del congreso.</p>
            </div>
          </div>
          <LoginForm callbackUrl={callbackUrl} initialError={initialError} />
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded text-sm text-white/70 transition hover:text-white focus-visible:ring-offset-noche-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver a la web del congreso
          </Link>
        </p>
      </main>
    </div>
  );
}
