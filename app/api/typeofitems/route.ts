import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const items = await prisma.typeofitems.findMany({
      orderBy: { item_type: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const max = await prisma.typeofitems.aggregate({ _max: { id: true } });
    const nextId = (max._max.id || 0) + 1;

    const item = await prisma.typeofitems.create({
      data: { id: nextId, ...body },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Error creating" }, { status: 500 });
  }
}
