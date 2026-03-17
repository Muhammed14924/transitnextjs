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
    const status = searchParams.get("status") || undefined;
    const gateId = searchParams.get("gateId");
    const transportCompanyId = searchParams.get("transportCompanyId");

    const trips = await prisma.transport_trips.findMany({
      where: {
        ...(status && { status }),
        ...(gateId && { gate_id: parseInt(gateId) }),
        ...(transportCompanyId && { transport_company_id: parseInt(transportCompanyId) }),
      },
      include: {
        gate: {
          select: { id: true, gate_name: true, gate_code: true },
        },
        transport_company: {
          select: { id: true, trans_name: true },
        },
        waybills: {
          include: {
            sender_company: {
              select: { id: true, company_name: true },
            },
            trader: {
              select: { id: true, trader_name: true, trader_code: true },
            },
            destination: {
              select: { id: true, destination_name: true },
            },
          },
        },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error("Transport Trips API error:", error);
    return NextResponse.json(
      { error: "Error fetching transport trips" },
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
      trip_number,
      loading_date,
      driver_name,
      driver_phone,
      plate_front,
      plate_back,
      gate_id,
      transport_company_id,
      sort_num,
      discharge_date,
      truck_fare,
      notes,
      status,
      documents,
    } = body;

    const trip = await prisma.transport_trips.create({
      data: {
        trip_number: trip_number || null,
        loading_date: loading_date ? new Date(loading_date) : null,
        driver_name: driver_name || null,
        driver_phone: driver_phone || null,
        plate_front: plate_front || null,
        plate_back: plate_back || null,
        gate_id: gate_id ? parseInt(gate_id) : null,
        transport_company_id: transport_company_id ? parseInt(transport_company_id) : null,
        sort_num: sort_num ? parseInt(sort_num) : null,
        discharge_date: discharge_date ? new Date(discharge_date) : null,
        truck_fare: truck_fare ? parseFloat(truck_fare) : null,
        notes: notes || null,
        status: status || "DISPATCHED",
        ...(documents && documents.length > 0
          ? {
              documents: {
                create: documents.map((doc: any) => ({
                  document_type: doc.document_type,
                  document_number: doc.document_number || null,
                  file_url: doc.file_url,
                  file_name: doc.file_name,
                })),
              },
            }
          : {}),
      },
      include: {
        gate: {
          select: { id: true, gate_name: true },
        },
        transport_company: {
          select: { id: true, trans_name: true },
        },
        documents: true,
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error("Transport Trips API POST error:", error);
    return NextResponse.json(
      { error: "Error creating transport trip" },
      { status: 500 },
    );
  }
}
