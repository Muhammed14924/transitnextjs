import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const item = await prisma.gates.findUnique({ where: { id: parseInt(id) } });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // نستخرج الحقول ونتجاهل id الخاص بـ body لتجنب مشاكل تحديث المفتاح الأساسي
    const {
      id: _,
      gate_name,
      gate_code,
      location,
      connecting_country,
      isActive,
    } = body;

    const data: any = {};
    if (gate_name !== undefined) data.gate_name = gate_name;
    // تحويل النص الفارغ إلى null لتجنب مشاكل Unique Constraint
    if (gate_code !== undefined) data.gate_code = gate_code || null;
    if (location !== undefined) data.location = location || null;
    if (connecting_country !== undefined)
      data.connecting_country = connecting_country || null;
    if (isActive !== undefined) data.isActive = isActive;

    const item = await prisma.gates.update({
      where: { id: parseInt(id) },
      data,
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating gate:", error);
    return NextResponse.json({ error: "Error updating" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.gates.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting" }, { status: 500 });
  }
}
