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
        shipment_comp: true,
        documents: true,
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

    const updated = await prisma.transit_shipments.update({
      where: { id: shipmentId },
      data: {
        shipment_number: body.shipment_number || undefined,
        bl_number: body.bl_number || undefined,
        shipping_company: body.shipping_company
          ? parseInt(body.shipping_company)
          : undefined,
        sender_company_id: body.sender_company_id
          ? parseInt(body.sender_company_id)
          : undefined,
        port_of_loading: body.port_of_loading
          ? parseInt(body.port_of_loading)
          : undefined,
        port_of_discharge: body.port_of_discharge
          ? parseInt(body.port_of_discharge)
          : undefined,
        total_containers:
          body.total_containers !== undefined
            ? parseInt(body.total_containers)
            : undefined,
        containers_numbers: body.containers_numbers,
        total_gross_weight:
          body.total_gross_weight !== undefined
            ? parseFloat(body.total_gross_weight)
            : undefined,
        arrival_date: body.arrival_date
          ? new Date(body.arrival_date)
          : undefined,
        status: body.status || undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
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
