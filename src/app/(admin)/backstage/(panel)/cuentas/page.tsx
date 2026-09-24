import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { requireAdminPage } from "@/lib/admin/guard";
import { listUsers } from "@/lib/admin/users";
import { PageHeader } from "@/components/admin/bits";
import { buttonClass } from "@/components/admin/ui";
import { UsersManager } from "@/components/admin/UsersManager";

export const metadata: Metadata = { title: "Cuentas" };

export default async function AccountsPage() {
  const user = await requireAdminPage();

  if (user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-linea bg-white p-6 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-8 w-8 text-amber-600" aria-hidden="true" />
        <h1 className="mt-3 font-sans text-lg font-semibold tracking-normal">Solo para administración</h1>
        <p className="mt-1 text-sm text-tinta-suave">
          Tu cuenta es de edición: puedes gestionar el programa, los espacios y los ajustes, pero no las cuentas.
        </p>
        <Link href="/backstage" className={buttonClass("secondary", "md", "mt-5")}>
          Volver al resumen
        </Link>
      </div>
    );
  }

  const users = await listUsers();
  return (
    <>
      <PageHeader
        eyebrow="Cuentas"
        title="Cuentas del panel"
        description="Las cuentas de edición gestionan programa, espacios y ajustes; las de administración, además, las cuentas. No se borran: se desactivan."
      />
      <UsersManager users={users} currentUserId={user.id} />
    </>
  );
}
