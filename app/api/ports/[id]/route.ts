import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const item = await prisma.ports.findUnique({ where: { id: parseInt(id) } });
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

    const { id: _, port_name, port_code, city, country, isActive } = body;

    const data: any = {};
    if (port_name !== undefined) data.port_name = port_name;
    if (port_code !== undefined) data.port_code = port_code || null;
    if (city !== undefined) data.city = city || null;
    if (country !== undefined) data.country = country || null;
    if (isActive !== undefined) data.isActive = isActive;

    const item = await prisma.ports.update({
      where: { id: parseInt(id) },
      data,
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating port:", error);
    return NextResponse.json({ error: "Error updating" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.ports.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting" }, { status: 500 });
  }
}
