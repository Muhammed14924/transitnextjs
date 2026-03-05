import { prisma } from "@/app/lib/db";
import { generateToken, hashPassword, verifyPassword } from "@/app/lib/auth";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Check for existing user
    const userFromDb = await prisma.user.findUnique({
      where: { email },
      include: { team: true },
    });
    if (!userFromDb) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValidPassword = await verifyPassword(password, userFromDb.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = generateToken(userFromDb.id);
    //crete response
    const response = NextResponse.json(
      {
        message: "User logged in successfully",
        user: {
          id: userFromDb.id,
          name: userFromDb.name,
          email: userFromDb.email,
          role: userFromDb.role,
          teamId: userFromDb.teamId,
          team: userFromDb.team,
          token,
        },
      },
      { status: 200 },
    );
    //set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.log(error, "login failed");
    return NextResponse.json(
      { error: "Internal server error , login failed" },
      { status: 500 },
    );
  }
};
