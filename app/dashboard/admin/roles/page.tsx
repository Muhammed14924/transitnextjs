import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/api-helper";
import RolesPermissionsClient from "./_components/RolesPermissionsClient";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const user = await getSessionUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [permissions, rolePermissions] = await Promise.all([
    prisma.permission.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.rolePermission.findMany({
      include: { permission: true },
    }),
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <RolesPermissionsClient
        permissions={permissions}
        rolePermissions={rolePermissions}
      />
    </div>
  );
}
