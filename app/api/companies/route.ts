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

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Generate ID since it's not autoincremented in schema
    const maxIdResult = await prisma.companies.aggregate({
      _max: { id: true },
    });
    const nextId = (maxIdResult._max.id || 0) + 1;

    const company = await prisma.companies.create({
      data: {
        id: nextId,
        company_name: body.company_name,
        compen: body.compen || body.company_name,
        place: body.place || "N/A",
        company_code: body.company_code || "000",
        Sequence1: body.Sequence1 || 0,
        Sequence2: body.Sequence2 || 0,
        first_internal_serial: body.first_internal_serial || 0,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("Companies API POST error:", error);
    return NextResponse.json(
      { error: "Error creating company" },
      { status: 500 },
    );
  }
}
