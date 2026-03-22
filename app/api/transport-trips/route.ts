import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getSessionUser, unauthorized, forbidden } from "@/app/lib/api-helper";
import { hasPermission } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (!(await hasPermission(user, 'VIEW_TRIP'))) return forbidden();

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
        source_company: {
          select: { id: true, company_name: true },
        },
        source_container: {
          select: { id: true, container_number: true, container_type: true },
        },
        source_shipment: {
          select: { id: true, bl_number: true, sender_company_id: true },
        },
        source_depot: {
          select: { id: true, depot_name: true },
        },
        destination_depot: {
          select: { id: true, depot_name: true },
        },
        waybills: {
          include: {
            trader: {
              select: { id: true, trader_name: true, trader_code: true },
            },
            destination: {
              select: { id: true, destination_name: true },
            },
            sender_company: {
              select: { id: true, company_name: true },
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
    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (!(await hasPermission(user, 'CREATE_TRIP'))) return forbidden();

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
      route_type,
      source_company_id,
      source_shipment_id,
      source_container_id,
      source_depot_id,
      destination_depot_id,
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
        route_type: route_type || null,
        source_company_id: source_company_id ? parseInt(source_company_id) : null,
        source_shipment_id: source_shipment_id ? parseInt(source_shipment_id) : null,
        source_container_id: source_container_id ? parseInt(source_container_id) : null,
        source_depot_id: source_depot_id ? parseInt(source_depot_id) : null,
        destination_depot_id: destination_depot_id ? parseInt(destination_depot_id) : null,
        status: status || "DISPATCHED",
        ...(documents && documents.length > 0
          ? {
              documents: {
                create: documents.map((doc: { document_type: string; document_number?: string; file_url: string; file_name: string }) => ({
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
