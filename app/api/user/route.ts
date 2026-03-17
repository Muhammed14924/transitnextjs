import { getSessionUser, unauthorized, forbidden, badRequest, serverError } from "@/app/lib/api-helper";
import { hasPermission } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { hashPassword } from "@/app/lib/auth";
import { Prisma, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
    try {
        const user = await getSessionUser();
        if (!user) return unauthorized();
        if (!(await hasPermission(user, 'VIEW_USERS'))) return forbidden();

        const searchParams = request.nextUrl.searchParams;
        const role = searchParams.get("role");
        const queryTeamId = searchParams.get("teamId");

        const where: Prisma.UserWhereInput = {};
        if (user.role !== Role.ADMIN) {
            where.teamId = user.teamId;
        }

        if (queryTeamId) {
            where.teamId = queryTeamId;
        }
        if (role && Object.values(Role).includes(role as Role)) {
            where.role = role as Role;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
                team: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                createdAt: true,

            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return NextResponse.json(users, { status: 200 })
    } catch (error) {
        console.log(error, "get users failed");
        return serverError("Internal server error, users failed");
    }
}

export const POST = async (request: NextRequest) => {
    try {
        const user = await getSessionUser();
        if (!user) return unauthorized();
        if (!(await hasPermission(user, 'MANAGE_USERS'))) return forbidden();

        const { username, email, password, role, teamId } = await request.json();
        if (!username || !email || !password) {
            return badRequest("Missing required fields");
        }
        const allowedRoles = [Role.USER, Role.MANAGER, Role.GUEST, Role.ADMIN];
        if (role && !allowedRoles.includes(role)) {
            return badRequest("Invalid role");
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }
        
    const assignedTeamId = teamId || user.teamId;
    const hashed = await hashPassword(password);
    
    const newUser = await prisma.user.create({
        data: { 
            name: username,
            username: username, 
            email, 
            password: hashed, 
            role: role || Role.USER,
            teamId: assignedTeamId
        },
        select: { id: true, name: true, username: true, email: true, role: true, teamId: true, createdAt: true },
    });
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.log(error, "create user failed");
        return serverError("Internal server error");
    }
}
export const DELETE = async (request: NextRequest) => {
    try {
        const user = await getSessionUser();
        if (!user) return unauthorized();
        if (!(await hasPermission(user, 'MANAGE_USERS'))) return forbidden();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        if (!userId) {
            return badRequest("userId is required");
        }
        if (userId === user.id) {
            return badRequest("You cannot delete your own account");
        }

        if (user.role !== Role.ADMIN) {
            const targetUser = await prisma.user.findUnique({ where: { id: userId } });
            if (!targetUser || targetUser.teamId !== user.teamId) {
                return forbidden();
            }
        }

        await prisma.user.delete({ where: { id: userId } });
        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        console.log(error, "delete user failed");
        return serverError("Internal server error");
    }
}