"use client";

import { useActionState, useState } from "react";
import { CircleAlert, Eye, EyeOff, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/admin/auth-actions";
import { Button, Field, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

/** Formulario de acceso (acción de servidor con Auth.js Credentials). */
export function LoginForm({ callbackUrl, initialError }: { callbackUrl: string; initialError: string | null }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {
    error: initialError,
    email: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{state.error}</p>
        </div>
      ) : null}

      <Field id="login-email" label="Correo electrónico">
        <input
          id="login-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          autoFocus
          defaultValue={state.email}
          className={inputClass}
          placeholder="nombre@usal.es"
        />
      </Field>

      <Field id="login-password" label="Contraseña">
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={cn(inputClass, "pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
            aria-controls="login-password"
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-tinta-tenue hover:text-mar-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            <span className="sr-only">{showPassword ? "Ocultar la contraseña" : "Mostrar la contraseña"}</span>
          </button>
        </div>
      </Field>

      <Button type="submit" variant="primary" busy={pending} className="h-10 w-full">
        {pending ? null : <LogIn className="h-4 w-4" aria-hidden="true" />}
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
