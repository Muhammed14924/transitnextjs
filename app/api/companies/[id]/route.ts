import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const company = await prisma.companies.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            transit_shipments: true,
            comp_items: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Company Detail API GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const companyId = parseInt(id);
    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await prisma.companies.update({
      where: { id: companyId },
      data: {
        company_name: body.company_name,
        compen: body.compen,
        place: body.place,
        company_code: body.company_code,
        Sequence1: body.Sequence1,
        Sequence2: body.Sequence2,
        first_internal_serial: body.first_internal_serial,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Company Detail API PATCH error:", error);
    return NextResponse.json(
      { error: "Error updating company" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const companyId = parseInt(id);
    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.companies.delete({
      where: { id: companyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Company Detail API DELETE error:", error);
    return NextResponse.json(
      { error: "Error deleting company" },
      { status: 500 },
    );
  }
}
