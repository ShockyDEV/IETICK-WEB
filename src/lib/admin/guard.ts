import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/admin/errors";
import type { AdminUserInfo, Role } from "@/lib/admin/types";

/**
 * Guard del panel (defensa en profundidad). El middleware ya exige sesión
 * en /backstage/** y /api/admin/**, pero aquí se vuelve a comprobar:
 *   1) que hay sesión de Auth.js (JWT válido), y
 *   2) que la cuenta sigue existiendo y ACTIVA en la BD, con su rol ACTUAL
 *      (desactivar una cuenta o cambiarle el rol surte efecto al instante,
 *      sin esperar a que caduque el JWT).
 */
export type AdminUser = AdminUserInfo;

interface GuardOptions {
  /** Rol mínimo. EDITOR: programa y espacios; ADMIN: además, cuentas. */
  role?: Role;
}

/** Usuario actual (una consulta por petición gracias a `cache`). */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, active: true },
  });
  if (!user || !user.active) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
});

/** Para route handlers: lanza HttpError 401/403 (lo convierte `adminRoute`). */
export async function requireAdmin(options: GuardOptions = {}): Promise<AdminUser> {
  const user = await getCurrentAdmin();
  if (!user) throw new HttpError(401, "No autorizado: inicia sesión de nuevo.");
  if (options.role === "ADMIN" && user.role !== "ADMIN") {
    throw new HttpError(403, "Solo una cuenta de administración puede hacer esto.");
  }
  return user;
}

/** Para páginas del panel: redirige al acceso si no hay cuenta válida. */
export async function requireAdminPage(): Promise<AdminUser> {
  const user = await getCurrentAdmin();
  if (!user) redirect("/backstage/acceso?error=SessionRequired");
  return user;
}
