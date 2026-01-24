import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
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