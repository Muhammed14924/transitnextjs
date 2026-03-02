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
    const q = searchParams.get("q") || undefined;

    const traders = await prisma.traders.findMany({
      where: q
        ? {
            OR: [
              { trader: { contains: q, mode: "insensitive" } },
              { trader_code: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        _count: {
          select: { trans_2: true },
        },
      },
      orderBy: { trader: "asc" },
    });

    return NextResponse.json(traders);
  } catch (error) {
    console.error("Traders API error:", error);
    return NextResponse.json(
      { error: "Error fetching traders" },
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
    const maxIdResult = await prisma.traders.aggregate({
      _max: { id: true },
    });
    const nextId = (maxIdResult._max.id || 0) + 1;

    const trader = await prisma.traders.create({
      data: {
        id: nextId,
        trader: body.trader,
        trader_code: body.trader_code || "000",
      },
    });

    return NextResponse.json(trader);
  } catch (error) {
    console.error("Traders API POST error:", error);
    return NextResponse.json(
      { error: "Error creating trader record" },
      { status: 500 },
    );
  }
}
