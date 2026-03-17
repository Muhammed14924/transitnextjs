import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getSessionUser, unauthorized, forbidden, badRequest, serverError } from "@/app/lib/api-helper";
import { hasPermission, hashPassword } from "@/app/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();
    
    const { userId } = await params;
    
    // User can see their own profile, others need VIEW_USERS
    if (user.id !== userId && !(await hasPermission(user, 'VIEW_USERS'))) {
      return forbidden();
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        username: true,
        teamId: true,
        orgCompanyId: true,
        createdAt: true,
        team: { select: { id: true, name: true } },
        orgCompany: { select: { id: true, name: true } },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && targetUser.teamId !== user.teamId) {
      return forbidden();
    }

    return NextResponse.json(targetUser);
  } catch (error) {
    console.error("User Detail API GET error:", error);
    return serverError("Error fetching user");
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();

    const { userId } = await params;
    
    // Check if user is editing themselves or has permission to manage others
    const isSelf = user.id === userId;
    if (!isSelf && !(await hasPermission(user, 'MANAGE_USERS'))) {
      return forbidden();
    }
    const body = await req.json();

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && targetUser.teamId !== user.teamId) {
      return forbidden();
    }

    const { name, username, email, role, teamId, orgCompanyId, password } = body;

    const dataToUpdate: Prisma.UserUpdateInput = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (username !== undefined) dataToUpdate.username = username;
    if (email !== undefined) dataToUpdate.email = email;
    
    // Role, Team, and Org changes ALWAYS require MANAGE_USERS
    if (role !== undefined || teamId !== undefined || orgCompanyId !== undefined) {
      if (!(await hasPermission(user, 'MANAGE_USERS'))) {
        return forbidden("You don't have permission to change roles, teams, or organizations");
      }
      if (role !== undefined) dataToUpdate.role = role;
      if (teamId !== undefined) dataToUpdate.team = teamId ? { connect: { id: teamId } } : { disconnect: true };
      if (orgCompanyId !== undefined) dataToUpdate.orgCompany = orgCompanyId ? { connect: { id: orgCompanyId } } : { disconnect: true };
    }

    if (password && password.trim() !== "") {
      dataToUpdate.password = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        username: true,
        teamId: true,
        orgCompanyId: true,
        createdAt: true,
        team: { select: { id: true, name: true } },
        orgCompany: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("User Detail API PATCH error:", error);
    return serverError("Error updating user");
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) return unauthorized();
    if (!(await hasPermission(currentUser, 'MANAGE_USERS'))) return forbidden();

    const { userId } = await params;

    if (userId === currentUser.id) {
      return badRequest("You cannot delete your own account");
    }

    if (currentUser.role !== "ADMIN") {
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser || targetUser.teamId !== currentUser.teamId) {
        return forbidden();
      }
    }

    // Use transaction to delete related records first to avoid foreign key constraints
    await prisma.$transaction([
      prisma.chatMessage.deleteMany({ where: { userId } }),
      prisma.document.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User Detail API DELETE error:", error);
    return serverError("Error deleting user");
  }
}
