import { prisma } from "@/app/lib/db";
import { generateToken, hashPassword } from "@/app/lib/auth";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/register
 *
 * هذا الـ endpoint محمي بالكامل:
 * - إذا لم يكن هناك أي مستخدم في النظام → يسمح بإنشاء أول مستخدم كـ ADMIN (Bootstrap)
 * - في أي حالة أخرى → يرفض الطلب بـ 403
 *
 * إنشاء المستخدمين يتم فقط عبر الأدمين من خلال /api/user
 */
export const POST = async (request: NextRequest) => {
  try {
    // تحقق: هل يوجد أي مستخدم في قاعدة البيانات؟
    const usersCount = await prisma.user.count();

    // إذا كان يوجد مستخدمين بالفعل → لا يُسمح بالتسجيل الذاتي
    if (usersCount > 0) {
      return NextResponse.json(
        {
          error: "التسجيل الذاتي غير متاح. تواصل مع مسؤول النظام لإنشاء حسابك.",
        },
        { status: 403 },
      );
    }

    // Bootstrap: إنشاء أول مستخدم كـ ADMIN
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مسجل مسبقاً" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMIN, // أول مستخدم دائماً ADMIN
      },
      include: {
        team: true,
      },
    });

    const token = generateToken(user.id);

    const response = NextResponse.json(
      {
        message: "تم إنشاء حساب مسؤول النظام بنجاح",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          teamId: user.teamId,
          team: user.team,
          token,
        },
      },
      { status: 201 },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
