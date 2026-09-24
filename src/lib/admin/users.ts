import "server-only";
import * as bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/admin/errors";
import type { AdminUser } from "@/lib/admin/guard";
import type { UserCreateInput, UserUpdateInput } from "@/lib/admin/schemas";
import type { UserRow } from "@/lib/admin/types";

/**
 * Cuentas del panel (solo rol ADMIN). Sin borrado: se desactivan. Salvaguardas:
 *   · nadie puede desactivarse ni quitarse el rol ADMIN a sí mismo;
 *   · siempre debe quedar al menos una cuenta ADMIN activa.
 * Las contraseñas se guardan con bcrypt (coste 12, como el seed).
 */
const BCRYPT_COST = 12;

function toUserRow(u: User): UserRow {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

export async function listUsers(): Promise<UserRow[]> {
  const users = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { role: "asc" }, { email: "asc" }] });
  return users.map(toUserRow);
}

export async function createUser(input: UserCreateInput): Promise<UserRow> {
  const exists = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (exists) {
    throw new HttpError(409, "Ya hay una cuenta con ese correo.", [
      { path: "email", message: "Ya hay una cuenta con ese correo." },
    ]);
  }
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash: await bcrypt.hash(input.password, BCRYPT_COST),
    },
  });
  return toUserRow(user);
}

export async function updateUser(actor: AdminUser, id: string, input: UserUpdateInput): Promise<UserRow> {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new HttpError(404, "La cuenta no existe.");

  const self = actor.id === id;
  if (self && input.active === false) throw new HttpError(409, "No puedes desactivar tu propia cuenta.");
  if (self && input.role && input.role !== "ADMIN") {
    throw new HttpError(409, "No puedes quitarte a ti mismo el rol de administración.");
  }

  // ¿Deja de ser un ADMIN activo? Entonces debe quedar otro.
  const losesAdmin =
    target.role === "ADMIN" &&
    target.active &&
    ((input.role !== undefined && input.role !== "ADMIN") || input.active === false);
  if (losesAdmin) {
    const others = await prisma.user.count({ where: { role: "ADMIN", active: true, id: { not: id } } });
    if (others === 0) throw new HttpError(409, "Debe quedar al menos una cuenta de administración activa.");
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
  });
  return toUserRow(user);
}

export async function resetPassword(id: string, password: string): Promise<UserRow> {
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!target) throw new HttpError(404, "La cuenta no existe.");
  const user = await prisma.user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(password, BCRYPT_COST) },
  });
  return toUserRow(user);
}
