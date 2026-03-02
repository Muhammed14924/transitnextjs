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
