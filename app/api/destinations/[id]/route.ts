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
    const { destination_name, destination_type, isActive } = body;

    const item = await prisma.destination.update({
      where: { id: Number(id) },
      data: {
        destination_name,
        destination_type: destination_type || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating destination" },
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
    await prisma.destination.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting destination" },
      { status: 500 },
    );
  }
}
