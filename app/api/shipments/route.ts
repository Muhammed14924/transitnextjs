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
                { bl_number: { contains: q, mode: "insensitive" } },
                {
                  sender_company: {
                    company_name: { contains: q, mode: "insensitive" },
                  },
                },
                {
                  sub_company: {
                    sub_company_name: { contains: q, mode: "insensitive" },
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
            sub_company: {
              select: { sub_company_name: true },
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
            documents: true,
            containers: true,
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
    const { error } = await requireRole(...CAN_WRITE_ROLES);
    if (error) return error;

    const body = await req.json();

    if (!body.bl_number) {
      return NextResponse.json({ error: "bl_number is required" }, { status: 400 });
    }

    const shipment = await prisma.transit_shipments.create({
      data: {
        bl_number: body.bl_number,
        carrier: body.shipping_company ? { connect: { id: parseInt(body.shipping_company) } } : undefined,
        sender_company: body.sender_company_id ? { connect: { id: parseInt(body.sender_company_id) } } : undefined,
        sub_company: body.sub_company_id ? { connect: { id: parseInt(body.sub_company_id) } } : undefined,
        loading_port: body.port_of_loading ? { connect: { id: parseInt(body.port_of_loading) } } : undefined,
        discharge_port: body.port_of_discharge ? { connect: { id: parseInt(body.port_of_discharge) } } : undefined,
        arrival_date: body.arrival_date ? new Date(body.arrival_date) : null,
        expected_discharge_date: body.expected_discharge_date ? new Date(body.expected_discharge_date) : null,
        free_time_days: body.free_time_days ? parseInt(body.free_time_days) : 14,
        status: body.status || "PENDING",
        isActive: body.isActive !== undefined ? body.isActive : true,
        containers: body.containers && body.containers.length > 0 ? {
          create: body.containers.map((c: any) => ({
            container_number: c.container_number,
            container_type: c.container_type || null,
            weight: c.weight ? parseFloat(c.weight) : null,
            empty_return_date: c.empty_return_date ? new Date(c.empty_return_date) : null,
            customs_declaration_number: c.customs_declaration_number || null,
            item_count: c.item_count ? parseInt(c.item_count) : null,
            notes: c.notes || null,
          }))
        } : undefined,
        documents: body.documents && body.documents.length > 0 ? {
          create: body.documents.map((doc: any) => ({
            document_type: doc.document_type,
            document_number: doc.document_number || null,
            file_url: doc.file_url,
            file_name: doc.file_name,
          }))
        } : (body.bl_document_url ? {
          create: [{
            document_type: 'BL',
            file_url: body.bl_document_url,
            file_name: body.bl_document_name || 'Bill of Lading',
          }]
        } : undefined)
      },
      include: {
        containers: true,
        documents: true
      }
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
