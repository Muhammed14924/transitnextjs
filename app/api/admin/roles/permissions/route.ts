import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getSessionUser, unauthorized, forbidden, serverError } from "@/app/lib/api-helper";
import { hasPermission } from "@/app/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (!(await hasPermission(user, "VIEW_SETTINGS"))) return forbidden();

    const rolePermissions = await prisma.rolePermission.findMany({
      include: { permission: true },
    });

    return NextResponse.json(rolePermissions);
  } catch (error) {
    console.error("GET Role Permissions error:", error);
    return serverError("Error fetching role permissions");
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (!(await hasPermission(user, "MANAGE_SETTINGS"))) return forbidden();

    const body = await req.json();
    const { changes } = body as {
      changes: { role: string; permissionName: string; action: "add" | "remove" }[];
    };

    if (!Array.isArray(changes)) {
      return NextResponse.json({ error: "Invalid data format: 'changes' must be an array" }, { status: 400 });
    }

    const permissionNames = changes.map(c => c.permissionName);
    const existingPermissions = await prisma.permission.findMany({
      where: { name: { in: permissionNames } }
    });

    const permissionMap = new Map(existingPermissions.map(p => [p.name, p.id]));

    const operations = changes.map((change) => {
      const permissionId = permissionMap.get(change.permissionName);
      
      if (!permissionId) {
        throw new Error(`Permission ${change.permissionName} not found`);
      }

      if (change.action === "add") {
        return prisma.rolePermission.upsert({
          where: {
            role_permissionId: {
              role: change.role as Role,
              permissionId: permissionId,
            },
          },
          create: {
            role: change.role as Role,
            permissionId: permissionId,
          },
          update: {},
        });
      } else {
        return prisma.rolePermission.deleteMany({
          where: {
            role: change.role as Role,
            permissionId: permissionId,
          },
        });
      }
    });

    await prisma.$transaction(operations);

    return NextResponse.json({ success: true, updated: changes.length });
  } catch (error) {
    console.error("POST Role Permissions error:", error);
    return serverError("Error updating role permissions");
  }
}
