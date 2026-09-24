import type { NextAuthConfig } from "next-auth";

/**
 * Configuración base de Auth.js, segura para el runtime Edge (middleware):
 * no importa Prisma ni bcrypt. El provider Credentials se añade en
 * `src/lib/auth.ts`, que solo se ejecuta en Node. Mismo patrón que iuce-web.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/backstage/acceso",
    error: "/backstage/acceso",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
};
