import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin/guard";
import { listVenuesWithRooms } from "@/lib/admin/spaces";
import { PageHeader } from "@/components/admin/bits";
import { SpacesManager } from "@/components/admin/SpacesManager";

export const metadata: Metadata = { title: "Espacios" };

export default async function SpacesPage() {
  await requireAdminPage();
  const venues = await listVenuesWithRooms();

  return (
    <>
      <PageHeader
        eyebrow="Espacios"
        title="Edificios y salas"
        description="Los edificios agrupan las salas (columnas de la parrilla del programa). Las salas inactivas no aparecen en la web; una sala con sesiones no se puede borrar."
      />
      <SpacesManager venues={venues} />
    </>
  );
}
