import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");
    const traderId = searchParams.get("traderId");

    const waybills = await prisma.trip_waybills.findMany({
      where: {
        ...(tripId && { trip_id: parseInt(tripId) }),
        ...(traderId && { trader_id: parseInt(traderId) }),
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
            status: true,
          },
        },
        trader: {
          select: { id: true, trader_name: true, trader_code: true },
        },
        destination: {
          select: { id: true, destination_name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(waybills);
  } catch (error) {
    console.error("Trip Waybills API error:", error);
    return NextResponse.json(
      { error: "Error fetching waybills" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      trip_id,
      trader_id,
      destination_id,
      quantity,
      weight,
      notes,
    } = body;

    // Validate required fields
    if (!trip_id) {
      return NextResponse.json(
        { error: "trip_id is required" },
        { status: 400 },
      );
    }

    const tripId = parseInt(trip_id);

    // Get the trip to calculate allocated_fare
    const trip = await prisma.transport_trips.findUnique({
      where: { id: tripId },
      include: {
        waybills: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 },
      );
    }

    // Calculate allocated_fare: (this weight / total truck weight) * truck_fare
    let allocated_fare = null;
    if (trip.truck_fare && weight) {
      const currentWeight = parseFloat(weight) || 0;
      const existingWeight = trip.waybills.reduce(
        (sum, w) => sum + (Number(w.weight) || 0),
        0,
      );
      const totalWeight = existingWeight + currentWeight;

      if (totalWeight > 0) {
        const weightRatio = currentWeight / totalWeight;
        allocated_fare = Number(trip.truck_fare) * weightRatio;
      }
    }

    // Generate invoice_num using source company from trip
    let invoice_num = null;
    if (trip.source_company_id) {
      const sourceCompanyId = trip.source_company_id;
      
      // Get the latest invoice number for this source company across ANY trip
      const lastWaybill = await prisma.trip_waybills.findFirst({
        where: { trip: { source_company_id: sourceCompanyId } },
        orderBy: { invoice_num: "desc" },
      });

      if (lastWaybill && lastWaybill.invoice_num) {
        const numPart = lastWaybill.invoice_num.replace(/\D/g, "");
        const nextNum = parseInt(numPart) + 1;
        invoice_num = String(nextNum).padStart(7, "0");
      } else {
        const company = await prisma.companies.findUnique({
          where: { id: sourceCompanyId },
        });
        
        if (company && company.Sequence1) {
          invoice_num = String(company.Sequence1);
        } else {
          invoice_num = "0000001";
        }
      }
    }

    const waybill = await prisma.trip_waybills.create({
      data: {
        trip_id: tripId,
        trader_id: trader_id ? parseInt(trader_id) : null,
        destination_id: destination_id ? parseInt(destination_id) : null,
        invoice_num,
        quantity: quantity ? parseInt(quantity) : 0,
        weight: weight ? parseFloat(weight) : null,
        allocated_fare,
        notes: notes || null,
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
        trader: {
          select: { id: true, trader_name: true, trader_code: true },
        },
        destination: {
          select: { id: true, destination_name: true },
        },
      },
    });

    // Recalculate all waybills' allocated_fare after adding new waybill
    if (trip.truck_fare && trip.waybills.length > 0) {
      const allWaybills = await prisma.trip_waybills.findMany({
        where: { trip_id: tripId },
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

    // Return updated waybill with recalculated values
    const updatedWaybill = await prisma.trip_waybills.findUnique({
      where: { id: waybill.id },
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
        trader: {
          select: { id: true, trader_name: true, trader_code: true },
        },
        destination: {
          select: { id: true, destination_name: true },
        },
      },
    });

    return NextResponse.json(updatedWaybill, { status: 201 });
  } catch (error) {
    console.error("Trip Waybills API POST error:", error);
    return NextResponse.json(
      { error: "Error creating waybill" },
      { status: 500 },
    );
  }
}
