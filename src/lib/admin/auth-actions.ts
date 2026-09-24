"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { safeCallbackUrl } from "@/lib/admin/callback-url";

/**
 * Acciones de servidor del acceso al panel (Auth.js v5, provider Credentials).
 * `signIn` lanza la redirección de Next si todo va bien; si las credenciales
 * no valen (o salta el límite anti fuerza bruta de `authorize`) lanza
 * `CredentialsSignin`, que aquí se convierte en un mensaje para el formulario.
 */

export interface LoginState {
  error: string | null;
  email: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeCallbackUrl(formData.get("callbackUrl"));

  if (!email || !password) {
    return { error: "Escribe tu correo electrónico y tu contraseña.", email };
  }

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          error.type === "CredentialsSignin"
            ? "Correo o contraseña incorrectos. Tras varios intentos fallidos hay que esperar unos minutos."
            : "No se ha podido iniciar sesión. Inténtalo de nuevo en unos minutos.",
        email,
      };
    }
    // Redirección de Next tras el acceso correcto (NEXT_REDIRECT): se deja pasar
    throw error;
  }
  return { error: null, email };
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/backstage/acceso" });
}
