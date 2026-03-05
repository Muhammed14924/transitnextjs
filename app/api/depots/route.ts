// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/db";
// import { getCurrentUser } from "@/app/lib/auth";

// export async function GET() {
//   try {
//     const items = await prisma.depots.findMany({
//       orderBy: { depot_name: "asc" },
//     });
//     return NextResponse.json(items);
//   } catch (error) {
//     return NextResponse.json({ error: "Error fetching" }, { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const user = await getCurrentUser();
//     if (!user || user.role === "GUEST")
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const body = await req.json();
//     const max = await prisma.depots.aggregate({ _max: { id: true } });
//     const nextId = (max._max.id || 0) + 1;

//     const item = await prisma.depots.create({
//       data: { id: nextId, ...body },
//     });
//     return NextResponse.json(item);
//   } catch (error) {
//     return NextResponse.json({ error: "Error creating" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const items = await prisma.depots.findMany({
      orderBy: { createdAt: "desc" }, // ترتيب المستودعات من الأحدث للأقدم
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching depots" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    // 1. حماية المسار والتأكد من الصلاحيات
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. استلام البيانات القادمة من الواجهة الأمامية
    const body = await req.json();
    const { depot_name, location, manager_name, contact_number, isActive } =
      body;

    // 3. الفكرة البرمجية لتوليد التسلسل (depot_code)
    // نجلب آخر مستودع تمت إضافته للحصول على رقمه
    const lastDepot = await prisma.depots.findFirst({
      orderBy: {
        id: "desc",
      },
    });

    // إذا وجدنا مستودع سابق نزيد رقمه بـ 1، وإلا نبدأ من 1
    const nextNumber =
      lastDepot && lastDepot.depot_code
        ? parseInt(lastDepot.depot_code) + 1
        : 1;

    // تحويل الرقم إلى نص مكون من 3 خانات (مثل: 001, 015, 120)
    const newCode = String(nextNumber).padStart(3, "0");

    // 4. إنشاء المستودع في قاعدة البيانات بالحقول الجديدة
    const newItem = await prisma.depots.create({
      data: {
        depot_name,
        depot_code: newCode, // إدخال الكود المولد تلقائياً
        location: location || null,
        manager_name: manager_name || null,
        contact_number: contact_number || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error("Error creating depot:", error);
    return NextResponse.json(
      { error: error?.message || "Error creating depot" },
      { status: 500 },
    );
  }
}
