
import { getCurrentUser } from "@/app/lib/auth";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { checkUserPermission } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
export const PATCH = async (request: NextRequest, context: { params: Promise<{ userId: string }> }) => {
    try {
        const { userId } = await context.params;
        const { teamId } = await request.json();
        const user = await getCurrentUser();
        if (!user || !checkUserPermission(user, Role.ADMIN)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        // prevent users from changing their own role
        if (userId === user.id) {
            return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 })
        }
        const {role} = await request.json();
        //validate role
        const validateRole=[Role.USER,Role.MANAGER];

        if (!validateRole.includes(role )) {
            return NextResponse.json({ error: "Invalid role or you cant have more than one ADMIN role" }, { status: 400 })
        }

        if (teamId) {
            const team = await prisma.team.findUnique({ where: { id: teamId } })
            if (!team) {
                return NextResponse.json({ error: "team not found" }, { status: 404 })
            }
        }
        //update user team
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
            include: {
                team: true
            }
        })
        return NextResponse.json({ user: updatedUser, message: `User role updated to ${role} successfully` }, { status: 200 })
    } catch (error) {
        console.log(error, "update user role failed");
        return NextResponse.json({ error: "Internal server error , update user role failed" }, { status: 500 })
    }

}