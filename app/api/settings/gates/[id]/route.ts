import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getSessionUser, unauthorized, forbidden, serverError } from "@/app/lib/api-helper";
import { hasPermission } from "@/app/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (!(await hasPermission(user, "MANAGE_SETTINGS"))) return forbidden();

    const { id: paramId } = await params;
    const id = parseInt(paramId, 10);
    const body = await req.json();

    const updated = await prisma.gates.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT Gates API error:", error);
    return serverError("Failed to update gate");
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (!(await hasPermission(user, "MANAGE_SETTINGS"))) return forbidden();

    const { id: paramId } = await params;
    const id = parseInt(paramId, 10);

    await prisma.gates.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Gates API error:", error);
    return serverError("Failed to delete gate");
  }
}
