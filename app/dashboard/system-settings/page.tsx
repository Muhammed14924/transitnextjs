import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/api-helper";
import { hasPermission } from "@/app/lib/auth";
import SettingsClient from "./_components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getSessionUser();

  if (!user || !(await hasPermission(user, "VIEW_SETTINGS"))) {
    redirect("/dashboard");
  }

  const [
    ports,
    gates,
    units,
    traders,
    transportCompanies,
    destinations,
  ] = await Promise.all([
    prisma.ports.findMany({ orderBy: { id: "asc" } }),
    prisma.gates.findMany({ orderBy: { id: "asc" } }),
    prisma.units.findMany({ orderBy: { id: "asc" } }),
    prisma.traders.findMany({ orderBy: { id: "asc" } }),
    prisma.transport_company.findMany({ orderBy: { id: "asc" } }),
    prisma.destination.findMany({ orderBy: { id: "asc" } }),
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Manage operations and system reference data
        </p>
      </div>

      <SettingsClient
        ports={JSON.parse(JSON.stringify(ports))}
        gates={JSON.parse(JSON.stringify(gates))}
        units={JSON.parse(JSON.stringify(units))}
        traders={JSON.parse(JSON.stringify(traders))}
        transportCompanies={JSON.parse(JSON.stringify(transportCompanies))}
        destinations={JSON.parse(JSON.stringify(destinations))}
      />
    </div>
  );
}
