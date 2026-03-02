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
