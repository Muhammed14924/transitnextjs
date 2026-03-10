import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shipmentComps = await prisma.shipment_comp.findMany({
      orderBy: { ship_comp: "asc" },
    });

    return NextResponse.json(shipmentComps);
  } catch (error) {
    console.error("Shipment Comps API GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
