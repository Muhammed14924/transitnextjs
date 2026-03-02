import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
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
        companies: true,
        ports: true,
        gates: true,
        shipment_comp: true,
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
  { params }: { params: { id: string } },
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

    // Update shipment logic
    const updated = await prisma.transit_shipments.update({
      where: { id: shipmentId },
      data: {
        shipping_date: body.shipping_date
          ? new Date(body.shipping_date)
          : undefined,
        arrival_date: body.arrival_date
          ? new Date(body.arrival_date)
          : undefined,
        status: body.status,
        shipping_company: body.shipping_company,
        shipment_number: body.shipment_number,
        container_number: body.container_number,
        quantity: body.quantity,
        weight: body.weight,
        company_name: body.company_name,
        goods_description: body.goods_description,
        invoice_number: body.invoice_number,
        invoice_date: body.invoice_date
          ? new Date(body.invoice_date)
          : undefined,
        origin: body.origin,
        port: body.port,
        crossing_point: body.crossing_point,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Shipment Detail API PATCH error:", error);
    return NextResponse.json(
      { error: "Error updating shipment" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const shipmentId = parseInt(id);
    if (isNaN(shipmentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.transit_shipments.delete({
      where: { id: shipmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shipment Detail API DELETE error:", error);
    return NextResponse.json(
      { error: "Error deleting shipment" },
      { status: 500 },
    );
  }
}
