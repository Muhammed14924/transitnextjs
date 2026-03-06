import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;

    const items = await prisma.traders.findMany({
      where: q
        ? {
            OR: [
              { trader_name: { contains: q, mode: "insensitive" } },
              { trader_code: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { contact_person: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        _count: {
          select: { trans_2: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Traders API error:", error);
    return NextResponse.json(
      { error: "Error fetching traders" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      trader_name,
      contact_person,
      phone,
      email,
      address,
      tax_number,
      opening_balance,
      credit_limit,
      isActive,
    } = body;

    // --- المنطق البرمجي لتوليد كود التاجر التسلسلي ---
    // 1. نجلب آخر تاجر تم إضافته لترتيب ID تنازلياً
    const lastTrader = await prisma.traders.findFirst({
      orderBy: { id: "desc" },
    });

    // 2. تحديد الرقم التالي (إذا كان موجوداً نضيف 1، وإلا نبدأ من 1)
    let nextNumber = 1;
    if (lastTrader && lastTrader.trader_code) {
      // نستخرج الرقم من النص في حال كان هناك أحرف مستقبلاً، أو نحوله مباشرة
      const numberPart = lastTrader.trader_code.replace(/\D/g, "");
      nextNumber = numberPart ? parseInt(numberPart) + 1 : 1;
    }

    // 3. تحويل الرقم إلى نص مكون من 4 خانات
    const newCode = String(nextNumber).padStart(3, "0");

    // إنشاء التاجر بالحقول الجديدة والكود المولد
    const newItem = await prisma.traders.create({
      data: {
        trader_code: newCode,
        trader_name,
        contact_person: contact_person || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        tax_number: tax_number || null,
        opening_balance: opening_balance ? parseFloat(opening_balance) : 0,
        credit_limit: credit_limit ? parseFloat(credit_limit) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating trader:", error);
    return NextResponse.json(
      { error: "Error creating trader" },
      { status: 500 },
    );
  }
}
