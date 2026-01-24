
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

        if (teamId) {
            const team = await prisma.team.findUnique({ where: { id: teamId } })
            if (!team) {
                return NextResponse.json({ error: "team not found" }, { status: 404 })
            }
        }
        //update user team
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { teamId },
            include: {
                team: true
            }
        })
        return NextResponse.json({ user: updatedUser, message: teamId ? "User team updated successfully" : "User team removed successfully" }, { status: 200 })
    } catch (error) {
        console.log(error, "update user team failed");
        return NextResponse.json({ error: "Internal server error , update user team failed" }, { status: 500 })
    }

}