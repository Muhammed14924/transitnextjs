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
    const transportId = parseInt(id);

    if (isNaN(transportId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const vh = await prisma.transport.findUnique({
      where: { id: transportId },
      include: {
        gates: {
          select: { gate_name: true },
        },
      },
    });

    if (!vh) {
      return NextResponse.json(
        { error: "Transport record not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(vh);
  } catch (error) {
    console.error("Transport Detail API GET error:", error);
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
    const transportId = parseInt(id);
    if (isNaN(transportId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await prisma.transport.update({
      where: { id: transportId },
      data: {
        driver: body.driver,
        driver_num: body.driver_num,
        plate_front: body.plate_front,
        plate_back: body.plate_back,
        sort_num: body.sort_num,
        notes: body.notes,
        transport_company: body.transport_company,
        gate: body.gate,
        car_id: body.car_id,
        download_date: body.download_date
          ? new Date(body.download_date)
          : undefined,
        discharge_date: body.discharge_date
          ? new Date(body.discharge_date)
          : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Transport Detail API PATCH error:", error);
    return NextResponse.json(
      { error: "Error updating transport" },
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
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const transportId = parseInt(id);
    if (isNaN(transportId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.transport.delete({
      where: { id: transportId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transport Detail API DELETE error:", error);
    return NextResponse.json(
      { error: "Error deleting transport" },
      { status: 500 },
    );
  }
}
