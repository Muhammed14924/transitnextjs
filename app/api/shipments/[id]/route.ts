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
    const shipmentId = parseInt(id);

    if (isNaN(shipmentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const shipment = await prisma.transit_shipments.findUnique({
      where: { id: shipmentId },
      include: {
        sender_company: true,
        loading_port: true,
        discharge_port: true,
        carrier: true,
        documents: true,
        containers: {
          include: { items: true }
        }
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(shipment);
  } catch (error) {
    console.error("Shipment Detail API GET error:", error);
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
    const shipmentId = parseInt(id);
    if (isNaN(shipmentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    // 1. Delete existing containers (if we want to replace them all for simplicity)
    await prisma.shipment_containers.deleteMany({
      where: { shipment_id: shipmentId }
    });

    const updated = await prisma.transit_shipments.update({
      where: { id: shipmentId },
      data: {
        bl_number: body.bl_number || undefined,
        carrier: body.shipping_company ? { connect: { id: parseInt(body.shipping_company) } } : undefined,
        sender_company: body.sender_company_id ? { connect: { id: parseInt(body.sender_company_id) } } : undefined,
        loading_port: body.port_of_loading ? { connect: { id: parseInt(body.port_of_loading) } } : undefined,
        discharge_port: body.port_of_discharge ? { connect: { id: parseInt(body.port_of_discharge) } } : undefined,
        arrival_date: body.arrival_date ? new Date(body.arrival_date) : null,
        expected_discharge_date: body.expected_discharge_date ? new Date(body.expected_discharge_date) : null,
        free_time_days: (body.free_time_days !== undefined && body.free_time_days !== null)
          ? parseInt(body.free_time_days) 
          : 14,
        status: body.status || undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        containers: body.containers && body.containers.length > 0 ? {
          create: body.containers.map((c: any) => ({
            container_number: c.container_number,
            container_type: c.container_type || null,
            weight: c.weight ? parseFloat(c.weight) : null,
            empty_return_date: c.empty_return_date ? new Date(c.empty_return_date) : null,
            customs_declaration_number: c.customs_declaration_number || null,
            hs_code: c.hs_code || null,
            items: c.item_ids && c.item_ids.length > 0 ? {
              create: c.item_ids.map((itemId: number) => ({
                comp_item: { connect: { id: parseInt(itemId as any) } }
              }))
            } : undefined
          }))
        } : undefined,
      },
      include: {
        containers: {
          include: { items: true }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Shipment Detail API PATCH error:", error);
    return NextResponse.json(
      { error: "Error updating shipment: " + (error as Error).message },
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
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const shipmentId = parseInt(id);
    if (isNaN(shipmentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Check if shipment exists before trying to delete
    const existing = await prisma.transit_shipments.findUnique({
      where: { id: shipmentId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "الشحنة غير موجودة أو تم حذفها مسبقاً" },
        { status: 404 },
      );
    }

    await prisma.transit_shipments.delete({
      where: { id: shipmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shipment Detail API DELETE error:", error);
    return NextResponse.json(
      { error: `Error deleting shipment: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
