import { PrismaClient } from "@prisma/client";

/**
 * Cliente Prisma como singleton. En desarrollo Next.js recarga los módulos a
 * menudo; se guarda la instancia en `globalThis` para no agotar conexiones.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
