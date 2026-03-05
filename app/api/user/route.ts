import { getCurrentUser } from "@/app/lib/auth";
import { requireRole } from "@/app/lib/auth-server";
import { prisma } from "@/app/lib/db";
import { hashPassword } from "@/app/lib/auth";
import { Prisma, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const searchParams = request.nextUrl.searchParams;
        const role = searchParams.get("role");
        const teamId = searchParams.get("teamId");
        //built where clause based on user role
        const where: Prisma.UserWhereInput = {};
        if (user.role === Role.ADMIN) {

        } else if (user.role === Role.MANAGER) {
            where.OR = [
                { teamId: user.teamId },
                { role: Role.USER }
            ]
        } else {
            //regular users can only see their own team members
            where.teamId = user.teamId;
            where.role = { not: Role.ADMIN }

        }
        //additional filters
        if (teamId) {
            where.teamId = teamId
        }
        if (role && Object.values(Role).includes(role as Role)) {
            where.role = role as Role
        }
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
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
        return NextResponse.json({ error: "Internal server error , users failed" }, { status: 500 })
    }
}

export const POST = async (request: NextRequest) => {
    try {
        const { user, error } = await requireRole(Role.ADMIN);
        if (error) return error;

        const { username, email, password, role } = await request.json();
        if (!username || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const allowedRoles = [Role.USER, Role.MANAGER, Role.GUEST];
        if (role && !allowedRoles.includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }
        const hashed = await hashPassword(password);
        const newUser = await prisma.user.create({
            data: { name: username, email, password: hashed, role: role || Role.USER },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.log(error, "create user failed");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const DELETE = async (request: NextRequest) => {
    try {
        const { user, error } = await requireRole(Role.ADMIN);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }
        if (userId === user!.id) {
            return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
        }
        await prisma.user.delete({ where: { id: userId } });
        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        console.log(error, "delete user failed");
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}