import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";
import { requireRole, CAN_WRITE_ROLES } from "@/app/lib/auth-server";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || undefined;
    const q = searchParams.get("q") || undefined;

    const where: Record<string, unknown> = {
      AND: [
        status ? { status } : {},
        q
          ? {
              OR: [
                { shipment_number: { contains: q, mode: "insensitive" } },
                { bl_number: { contains: q, mode: "insensitive" } },
                { containers_numbers: { contains: q, mode: "insensitive" } },
                {
                  sender_company: {
                    company_name: { contains: q, mode: "insensitive" },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [shipments, total, pendingCount, deliveredCount, inTransitCount] =
      await Promise.all([
        prisma.transit_shipments.findMany({
          take: limit,
          skip: offset,
          where,
          include: {
            sender_company: {
              select: { company_name: true },
            },
            loading_port: {
              select: { port_name: true, country: true },
            },
            discharge_port: {
              select: { port_name: true, city: true },
            },
            carrier: {
              select: { trans_name: true },
            },
            documents: {
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.transit_shipments.count({ where }),
        prisma.transit_shipments.count({ where: { status: "PENDING" } }),
        prisma.transit_shipments.count({ where: { status: "DELIVERED" } }),
        prisma.transit_shipments.count({
          where: { status: { in: ["IN_TRANSIT", "ARRIVED"] } },
        }),
      ]);

    return NextResponse.json({
      shipments,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
      stats: {
        pending: pendingCount,
        delivered: deliveredCount,
        inTransit: inTransitCount,
      },
    });
  } catch (error) {
    console.error("Shipments API GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { user, error } = await requireRole(...CAN_WRITE_ROLES);
    if (error) return error;

    const body = await req.json();

    const shipment = await prisma.transit_shipments.create({
      data: {
        shipment_number: body.shipment_number || null,
        bl_number: body.bl_number || null,
        shipping_company: body.shipping_company
          ? parseInt(body.shipping_company)
          : null,
        sender_company_id: body.sender_company_id
          ? parseInt(body.sender_company_id)
          : null,
        port_of_loading: body.port_of_loading
          ? parseInt(body.port_of_loading)
          : null,
        port_of_discharge: body.port_of_discharge
          ? parseInt(body.port_of_discharge)
          : null,
        total_containers: body.total_containers
          ? parseInt(body.total_containers)
          : 0,
        containers_numbers: body.containers_numbers || null,
        total_gross_weight: body.total_gross_weight
          ? parseFloat(body.total_gross_weight)
          : null,
        arrival_date: body.arrival_date ? new Date(body.arrival_date) : null,
        status: body.status || "PENDING",
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    return NextResponse.json(shipment);
  } catch (err) {
    console.error("Shipments API POST error:", err);
    return NextResponse.json(
      { error: "Error creating shipment: " + (err as Error).message },
      { status: 500 },
    );
  }
}
