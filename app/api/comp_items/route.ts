import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.comp_items.findMany({
      include: {
        companies: true,
        typeofitems: true,
        units: true,
        tariff_schedule: true,
      },
      orderBy: { item_ar_name: "asc" },
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
    const max = await prisma.comp_items.aggregate({ _max: { id: true } });
    const nextId = (max._max.id || 0) + 1;

    const item = await prisma.comp_items.create({
      data: {
        id: nextId,
        internal_code: body.internal_code
          ? parseInt(body.internal_code)
          : nextId,
        item_ar_name: body.item_ar_name,
        item_en_name: body.item_en_name || body.item_ar_name,
        company_name: parseInt(body.company_name),
        price: body.price ? parseFloat(body.price) : 0,
        item_type: body.item_type ? parseInt(body.item_type) : null,
        weight: body.weight ? parseInt(body.weight) : 0,
        unit: body.unit ? parseInt(body.unit) : 1,
        package: body.package || "N/A",
        packet_weight: body.packet_weight ? parseInt(body.packet_weight) : 0,
        item_code: body.item_code ? parseInt(body.item_code) : nextId,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating" }, { status: 500 });
  }
}
