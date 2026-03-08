// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/db";
// import { getCurrentUser } from "@/app/lib/auth";

// export async function GET() {
//   try {
//     const items = await prisma.typeofitems.findMany({
//       orderBy: { item_type: "asc" },
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
//     const max = await prisma.typeofitems.aggregate({ _max: { id: true } });
//     const nextId = (max._max.id || 0) + 1;

//     const item = await prisma.typeofitems.create({
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
    const items = await prisma.typeofitems.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching item types" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { item_type, description, isActive } = body;

    // --- المنطق البرمجي لتوليد كود النوع ---
    const lastType = await prisma.typeofitems.findFirst({
      orderBy: { id: "desc" },
    });

    let nextNumber = 1;
    if (lastType && lastType.typecode) {
      const numberPart = lastType.typecode.replace(/\D/g, "");
      nextNumber = numberPart ? parseInt(numberPart) + 1 : 1;
    }

    // توليد الكود من 3 خانات (مثل: 001، 002، 015)
    const newCode = String(nextNumber).padStart(3, "0");

    const item = await prisma.typeofitems.create({
      data: {
        typecode: newCode,
        item_type,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating item type" },
      { status: 500 },
    );
  }
}
