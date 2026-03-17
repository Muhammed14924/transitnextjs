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
    const waybill = await prisma.trip_waybills.findUnique({
      where: { id: parseInt(id) },
      include: {
        trip: {
          select: { 
            id: true, 
            trip_number: true, 
            loading_date: true,
            plate_front: true,
            plate_back: true,
            truck_fare: true,
            status: true,
            gate: {
              select: { id: true, gate_name: true },
            },
            transport_company: {
              select: { id: true, trans_name: true },
            },
          },
        },
        sender_company: {
          select: { id: true, company_name: true, company_code: true },
        },
        trader: {
          select: { id: true, trader_name: true, trader_code: true },
        },
        destination: {
          select: { id: true, destination_name: true, destination_type: true },
        },
        container: {
          select: { id: true, container_number: true, container_type: true, weight: true },
        },
      },
    });

    if (!waybill) {
      return NextResponse.json({ error: "Waybill not found" }, { status: 404 });
    }

    return NextResponse.json(waybill);
  } catch (error) {
    console.error("Trip Waybill API GET error:", error);
    return NextResponse.json(
      { error: "Error fetching waybill" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;

    const {
      sender_company_id,
      trader_id,
      destination_id,
      container_id,
      quantity,
      weight,
      notes,
    } = body;

    const waybillId = parseInt(id);

    // Get current waybill and its trip
    const currentWaybill = await prisma.trip_waybills.findUnique({
      where: { id: waybillId },
      include: {
        trip: {
          include: {
            waybills: true,
          },
        },
      },
    });

    if (!currentWaybill) {
      return NextResponse.json(
        { error: "Waybill not found" },
        { status: 404 },
      );
    }

    const trip = currentWaybill.trip;

    // Recalculate allocated_fare if weight changed or truck_fare exists
    let newAllocatedFare: number | null = null;
    if (trip.truck_fare) {
      const newWeight = weight !== undefined ? parseFloat(weight) : Number(currentWaybill.weight) || 0;
      
      // Calculate total weight including the updated waybill
      const otherWaybillsWeight = trip.waybills
        .filter(w => w.id !== waybillId)
        .reduce((sum, w) => sum + (Number(w.weight) || 0), 0);
      
      const totalWeight = otherWaybillsWeight + newWeight;

      if (totalWeight > 0) {
        const weightRatio = newWeight / totalWeight;
        newAllocatedFare = Number(trip.truck_fare) * weightRatio;
      }
    }

    const updatedWaybill = await prisma.trip_waybills.update({
      where: { id: waybillId },
      data: {
        ...(sender_company_id !== undefined && { sender_company_id: sender_company_id ? parseInt(sender_company_id) : null }),
        ...(trader_id !== undefined && { trader_id: trader_id ? parseInt(trader_id) : null }),
        ...(destination_id !== undefined && { destination_id: destination_id ? parseInt(destination_id) : null }),
        ...(container_id !== undefined && { container_id: container_id ? parseInt(container_id) : null }),
        ...(quantity !== undefined && { quantity: quantity ? parseInt(quantity) : 0 }),
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(newAllocatedFare !== null && { allocated_fare: newAllocatedFare }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        trip: {
          select: { 
            id: true, 
            trip_number: true, 
            loading_date: true,
            plate_front: true,
            plate_back: true,
            truck_fare: true,
          },
        },
        sender_company: {
          select: { id: true, company_name: true, company_code: true },
        },
        trader: {
          select: { id: true, trader_name: true, trader_code: true },
        },
        destination: {
          select: { id: true, destination_name: true },
        },
      },
    });

    // Recalculate all waybills in the trip
    if (trip.truck_fare) {
      const allWaybills = await prisma.trip_waybills.findMany({
        where: { trip_id: trip.id },
      });

      const totalWeight = allWaybills.reduce(
        (sum, w) => sum + (Number(w.weight) || 0),
        0,
      );

      if (totalWeight > 0) {
        for (const w of allWaybills) {
          const weightRatio = (Number(w.weight) || 0) / totalWeight;
          const newAllocatedFare = Number(trip.truck_fare) * weightRatio;

          await prisma.trip_waybills.update({
            where: { id: w.id },
            data: { allocated_fare: newAllocatedFare },
          });
        }
      }
    }

    return NextResponse.json(updatedWaybill);
  } catch (error) {
    console.error("Trip Waybill API PATCH error:", error);
    return NextResponse.json(
      { error: "Error updating waybill" },
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
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const waybillId = parseInt(id);

    // Get waybill with its trip first
    const waybill = await prisma.trip_waybills.findUnique({
      where: { id: waybillId },
      include: {
        trip: {
          include: {
            waybills: true,
          },
        },
      },
    });

    if (!waybill) {
      return NextResponse.json(
        { error: "Waybill not found" },
        { status: 404 },
      );
    }

    const trip = waybill.trip;

    // Delete the waybill
    await prisma.trip_waybills.delete({
      where: { id: waybillId },
    });

    // Recalculate allocated_fare for remaining waybills in the trip
    if (trip.truck_fare) {
      const remainingWaybills = await prisma.trip_waybills.findMany({
        where: { trip_id: trip.id },
      });

      const totalWeight = remainingWaybills.reduce(
        (sum, w) => sum + (Number(w.weight) || 0),
        0,
      );

      if (totalWeight > 0) {
        for (const w of remainingWaybills) {
          const weightRatio = (Number(w.weight) || 0) / totalWeight;
          const newAllocatedFare = Number(trip.truck_fare) * weightRatio;

          await prisma.trip_waybills.update({
            where: { id: w.id },
            data: { allocated_fare: newAllocatedFare },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Trip Waybill API DELETE error:", error);
    return NextResponse.json(
      { error: "Error deleting waybill" },
      { status: 500 },
    );
  }
}
