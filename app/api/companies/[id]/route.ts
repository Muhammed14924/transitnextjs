import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id } = await params;

    // We strictly DO NOT allow updating Sequence1, Sequence2, company_code, or internal_serial to protect data integrity.
    const { company_name, compen, place, isActive, logo } = body;

    const item = await prisma.companies.update({
      where: { id: Number(id) },
      data: {
        company_name,
        compen: compen || null,
        place: place || null,
        isActive: isActive !== undefined ? isActive : true,
        logo: logo || null,
      },
    });

    return NextResponse.json(item);
  } catch {
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
    if (!user || user.role === "GUEST")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.companies.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "Cannot delete company. It may be linked to existing products or shipments.",
      },
      { status: 500 },
    );
  }
}
