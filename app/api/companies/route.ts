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
    const limit = parseInt(searchParams.get("limit") || "50");
    const q = searchParams.get("q") || undefined;

    const companies = await prisma.companies.findMany({
      take: limit,
      where: q
        ? {
            OR: [
              { company_name: { contains: q, mode: "insensitive" } },
              { compen: { contains: q, mode: "insensitive" } },
              { company_code: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        _count: {
          select: {
            transit_shipments: true,
            comp_items: true,
          },
        },
      },
      orderBy: { company_name: "asc" },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Companies API GET error:", error);
    return NextResponse.json(
      { error: "Error fetching companies" },
      { status: 500 },
    );
  }
}
