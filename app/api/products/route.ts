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
