import { requireAdminPage } from "@/lib/admin/guard";
import { AdminShell } from "@/components/admin/AdminShell";

/** Estructura común de las páginas del panel (todas menos /backstage/acceso). */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();
  return <AdminShell user={user}>{children}</AdminShell>;
}
