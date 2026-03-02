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
    const limit = parseInt(searchParams.get("limit") || "100");
    const companyId = parseInt(searchParams.get("companyId") || "0");
    const q = searchParams.get("q") || undefined;

    const products = await prisma.comp_items.findMany({
      take: limit,
      where: {
        AND: [
          companyId ? { company_name: companyId } : {},
          q
            ? {
                OR: [
                  { item_ar_name: { contains: q, mode: "insensitive" } },
                  { item_en_name: { contains: q, mode: "insensitive" } },
                  {
                    internal_code: isNaN(parseInt(q)) ? undefined : parseInt(q),
                  },
                ],
              }
            : {},
        ],
      },
      include: {
        companies: {
          select: { company_name: true },
        },
        units: {
          select: { unit_name: true },
        },
        typeofitems: {
          select: { item_type: true },
        },
      },
      orderBy: { item_ar_name: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Products (comp_items) API error:", error);
    return NextResponse.json(
      { error: "Error fetching products" },
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

    // Generate ID since it's not autoincremented in schema
    const maxIdResult = await prisma.comp_items.aggregate({
      _max: { id: true },
    });
    const nextId = (maxIdResult._max.id || 0) + 1;

    const product = await prisma.comp_items.create({
      data: {
        id: nextId,
        item_ar_name: body.item_ar_name,
        item_en_name: body.item_en_name || body.item_ar_name,
        internal_code: body.internal_code || nextId,
        company_name: body.company_name, // Int (Foreign Key)
        item_code: body.item_code || nextId,
        weight: body.weight || 0,
        package: body.package || "طرد",
        packet_weight: body.packet_weight || 0,
        unit: body.unit || 1, // Default unit
        price: body.price || 0,
        ismain_item: body.ismain_item || 0,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Products API POST error:", error);
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 },
    );
  }
}
