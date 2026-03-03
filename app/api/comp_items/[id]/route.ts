import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: any = { ...body };
    if (data.company_name) data.company_name = parseInt(data.company_name);
    if (data.price) data.price = parseFloat(data.price);
    if (data.item_type) data.item_type = parseInt(data.item_type);
    if (data.weight) data.weight = parseInt(data.weight);
    if (data.unit) data.unit = parseInt(data.unit);
    if (data.packet_weight) data.packet_weight = parseInt(data.packet_weight);

    const item = await prisma.comp_items.update({
      where: { id: parseInt(id) },
      data,
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Error updating" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.comp_items.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting" }, { status: 500 });
  }
}
