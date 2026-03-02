import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalShipments, activeTransport, totalCompanies, pendingShipments] =
      await Promise.all([
        prisma.transit_shipments.count(),
        prisma.transport.count(),
        prisma.companies.count(),
        prisma.transit_shipments.count({
          where: {
            OR: [
              { status: "قيد المعالجة" },
              { status: "Pending" },
              { status: "0" },
            ],
          },
        }),
      ]);

    // Last 30 days shipment volume for charts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historyRaw = await prisma.transit_shipments.findMany({
      where: {
        shipping_date: {
          gt: thirtyDaysAgo,
        },
      },
      select: {
        shipping_date: true,
      },
      orderBy: {
        shipping_date: "asc",
      },
    });

    // Simple grouping by date
    const historyMap: Record<string, number> = {};
    historyRaw.forEach((s) => {
      if (s.shipping_date) {
        const dateStr = s.shipping_date.toISOString().split("T")[0];
        historyMap[dateStr] = (historyMap[dateStr] || 0) + 1;
      }
    });

    const shipmentHistory = Object.entries(historyMap).map(([name, total]) => ({
      name,
      total,
    }));

    return NextResponse.json({
      totalShipments,
      activeTransport,
      totalCompanies,
      pendingShipments,
      shipmentHistory,
    });
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json(
      { error: "Error fetching stats" },
      { status: 500 },
    );
  }
}
