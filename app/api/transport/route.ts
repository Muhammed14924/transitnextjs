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
    const limit = parseInt(searchParams.get("limit") || "100");
    const q = searchParams.get("q") || undefined;

    const transport = await prisma.transport.findMany({
      take: limit,
      where: q
        ? {
            OR: [
              { driver: { contains: q, mode: "insensitive" } },
              { plate_front: { contains: q, mode: "insensitive" } },
              { plate_back: { contains: q, mode: "insensitive" } },
              { driver_num: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        gates: {
          select: { gate_name: true },
        },
      },
      orderBy: { download_date: "desc" },
    });

    return NextResponse.json(transport);
  } catch (error) {
    console.error("Transport API error:", error);
    return NextResponse.json(
      { error: "Error fetching transport" },
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

    // Generate ID since it's not autoincremented in schema
    const maxIdResult = await prisma.transport.aggregate({
      _max: { id: true },
    });
    const nextId = (maxIdResult._max.id || 0) + 1;

    const transport = await prisma.transport.create({
      data: {
        id: nextId,
        driver: body.driver,
        driver_num: body.driver_num || "N/A",
        plate_front: body.plate_front || "N/A",
        plate_back: body.plate_back || "N/A",
        sort_num: body.sort_num || 0,
        notes: body.notes || "",
        transport_company: body.transport_company, // Int (Foreign Key)
        gate: body.gate, // Int (Foreign Key)
        car_id: body.car_id || nextId,
        download_date: body.download_date
          ? new Date(body.download_date)
          : new Date(),
        discharge_date: body.discharge_date
          ? new Date(body.discharge_date)
          : undefined,
      },
    });

    return NextResponse.json(transport);
  } catch (error) {
    console.error("Transport API POST error:", error);
    return NextResponse.json(
      { error: "Error creating transport record" },
      { status: 500 },
    );
  }
}
