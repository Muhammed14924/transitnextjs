import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/db";
import { getSessionUser } from "@/app/lib/api-helper";
import UsersManagementClient from "./_components/UsersManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getSessionUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [usersData, teams, orgCompanies] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        username: true,
        teamId: true,
        orgCompanyId: true,
        createdAt: true,
        team: {
          select: { id: true, name: true },
        },
        orgCompany: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.team.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.orgCompany.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <UsersManagementClient
        initialUsers={JSON.parse(JSON.stringify(usersData))}
        teams={teams}
        orgCompanies={orgCompanies}
      />
    </div>
  );
}
