import { prisma } from "@/app/lib/db";
import { generateToken, hashPassword } from "@/app/lib/auth";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
    try {
        const { name, email, password, teamCode } = await request.json();

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 })
        }

        // Check for existing user
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 })
        }

        // Initialize teamId to null (fixes "used before being assigned" error)
        let teamId: string | null = null;

        if (teamCode) {
            const team = await prisma.team.findUnique({ where: { code: teamCode } })
            if (!team) {
                return NextResponse.json({ error: "please enter a valid team code" }, { status: 404 })
            }
            teamId = team.id
        }

        const hashedPassword = await hashPassword(password);

        // First user will be admin and the rest will be user
        const usersCount = await prisma.user.count();
        const role = usersCount === 0 ? Role.ADMIN : Role.USER;

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                teamId,
                role,
            },
            include: {
                team: true
            }
        })

        const token = generateToken(user.id);
        //crete response
        const response = NextResponse.json({
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                teamId: user.teamId,
                team: user.team,
                token
            }
        }, { status: 201 })
        //set cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7
        })
        return response;

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}