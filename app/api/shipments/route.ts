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
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || undefined;
    const q = searchParams.get("q") || undefined; // search term

    const where: any = {
      AND: [
        status ? { status } : {},
        q
          ? {
              OR: [
                { shipment_number: { contains: q, mode: "insensitive" } },
                { container_number: { contains: q, mode: "insensitive" } },
                { invoice_number: { contains: q, mode: "insensitive" } },
                {
                  companies: {
                    company_name: { contains: q, mode: "insensitive" },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [shipments, total] = await Promise.all([
      prisma.transit_shipments.findMany({
        take: limit,
        skip: offset,
        where,
        include: {
          companies: {
            select: { company_name: true },
          },
          ports: {
            select: { port_name: true },
          },
          shipment_comp: {
            select: { ship_comp: true },
          },
        },
        orderBy: { shipping_date: "desc" },
      }),
      prisma.transit_shipments.count({ where }),
    ]);

    return NextResponse.json({
      shipments,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
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
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Simplistic Create for now
    const shipment = await prisma.transit_shipments.create({
      data: {
        shipping_date: body.shipping_date
          ? new Date(body.shipping_date)
          : undefined,
        arrival_date: body.arrival_date
          ? new Date(body.arrival_date)
          : undefined,
        status: body.status || "قيد الانتظار",
        shipping_company: body.shipping_company, // Int (Foreign Key)
        shipment_number: body.shipment_number,
        container_number: body.container_number,
        quantity: body.quantity,
        weight: body.weight,
        company_name: body.company_name, // Int (Foreign Key)
        goods_description: body.goods_description,
        invoice_number: body.invoice_number,
        invoice_date: body.invoice_date
          ? new Date(body.invoice_date)
          : undefined,
        origin: body.origin,
        port: body.port, // Int (Foreign Key)
        crossing_point: body.crossing_point, // Int (Foreign Key)
      },
    });

    return NextResponse.json(shipment);
  } catch (error) {
    console.error("Shipments API POST error:", error);
    return NextResponse.json(
      { error: "Error creating shipment" },
      { status: 500 },
    );
  }
}
