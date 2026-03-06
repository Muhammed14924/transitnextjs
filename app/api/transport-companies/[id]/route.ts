import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const {
      trans_name,
      contact_person,
      phone,
      email,
      transport_type,
      opening_balance,
      isActive,
    } = body;

    const item = await prisma.transport_company.update({
      where: { id: Number(id) },
      data: {
        trans_name,
        contact_person: contact_person || null,
        phone: phone || null,
        email: email || null,
        transport_type: transport_type || null,
        opening_balance:
          opening_balance !== undefined
            ? parseFloat(opening_balance)
            : undefined,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error updating transport company" },
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
    await prisma.transport_company.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error deleting transport company" },
      { status: 500 },
    );
  }
}
