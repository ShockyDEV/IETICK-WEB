import type { Metadata } from "next";
import Link from "next/link";
import { FileDown, Users } from "lucide-react";
import { requireAdminPage } from "@/lib/admin/guard";
import { getProgrammeStatus, listDays } from "@/lib/admin/settings";
import { PageHeader } from "@/components/admin/bits";
import { Card, buttonClass } from "@/components/admin/ui";
import { DaysManager } from "@/components/admin/DaysManager";
import { ProgrammeStatusToggle } from "@/components/admin/ProgrammeStatusToggle";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const user = await requireAdminPage();
  const [status, days] = await Promise.all([getProgrammeStatus(), listDays()]);

  return (
    <>
      <PageHeader eyebrow="Ajustes" title="Ajustes del programa" description="Estado del programa, días del congreso y copia de seguridad." />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <Card
            titleId="dias"
            title="Días del congreso"
            description="Fechas en hora local de Madrid. Las etiquetas son las que se ven en las pestañas del programa público."
          >
            <DaysManager days={days} />
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card titleId="estado" title="Estado del programa">
            <ProgrammeStatusToggle status={status} />
          </Card>

          <Card
            titleId="exportar"
            title="Exportar programa"
            description="Descarga en JSON de edificios, salas, días, sesiones (con contribuciones, borradores y canceladas) y ajustes. Sirve como copia de seguridad o para otras herramientas."
          >
            <a href="/api/admin/export" download className={buttonClass("primary")}>
              <FileDown className="h-4 w-4" aria-hidden="true" />
              Exportar programa (JSON)
            </a>
          </Card>

          {user.role === "ADMIN" ? (
            <Card titleId="cuentas" title="Cuentas del panel" description="Crear cuentas, desactivarlas o restablecer contraseñas.">
              <Link href="/backstage/cuentas" className={buttonClass("secondary")}>
                <Users className="h-4 w-4" aria-hidden="true" />
                Gestionar cuentas
              </Link>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
