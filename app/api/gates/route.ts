// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/db";
// import { getCurrentUser } from "@/app/lib/auth";

// export async function GET() {
//   try {
//     const items = await prisma.gates.findMany({
//       orderBy: { gate_name: "asc" },
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
//     const max = await prisma.gates.aggregate({ _max: { id: true } });
//     const nextId = (max._max.id || 0) + 1;

//     const item = await prisma.gates.create({
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
    const items = await prisma.gates.findMany({
      orderBy: { createdAt: "asc" }, // الترتيب تصاعدي حسب التاريخ
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "Error fetching gates" },
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
    const { gate_name, gate_code, location, connecting_country, isActive } =
      body;

    const item = await prisma.gates.create({
      data: {
        gate_name,
        gate_code: gate_code || null,
        location: location || null,
        connecting_country: connecting_country || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating gate:", error);
    return NextResponse.json({ error: "Error creating gate" }, { status: 500 });
  }
}
