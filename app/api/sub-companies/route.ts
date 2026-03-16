import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const where = companyId ? { company_id: parseInt(companyId) } : {};

    const items = await prisma.sub_companies.findMany({
      where,
      include: {
        company: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "Error fetching sub-companies" },
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
    const { sub_company_name, company_id, isActive } = body;

    if (!sub_company_name || !company_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const item = await prisma.sub_companies.create({
      data: {
        sub_company_name,
        company_id: parseInt(company_id),
        isActive: isActive !== undefined ? isActive : true,
      },
      include: { company: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating sub-company:", error);
    const message = error instanceof Error ? error.message : "Error creating sub-company";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
