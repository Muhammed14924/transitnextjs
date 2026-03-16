import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const items = await prisma.depots.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        trader: true,
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching depots" },
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
    const {
      depot_name,
      location,
      manager_name,
      contact_number,
      expected_invoices,
      isActive,
      traderId,
    } = body;

    const invoicesCount = parseInt(expected_invoices) || 1000;

    // 1. Generate Depot Code (001, 002)
    const lastDepot = await prisma.depots.findFirst({
      orderBy: { id: "desc" },
    });
    const nextNumber =
      lastDepot && lastDepot.depot_code
        ? parseInt(lastDepot.depot_code) + 1
        : 1;
    const newCode = String(nextNumber).padStart(3, "0");

    // 2. Generate Invoice Sequences Based on Current Year (Reserved 80000+ block)
    const currentYearStr = new Date().getFullYear().toString().slice(-2); // e.g., "26"

    // Bounds for depots (YY80000 to YY99999)
    const minSeqForDepots = parseInt(`${currentYearStr}80000`); // e.g., 2680000
    const maxSeqForDepots = parseInt(`${currentYearStr}99999`); // e.g., 2699999

    // Find the last sequence used for DEPOTS THIS YEAR
    const lastSequenceDepot = await prisma.depots.findFirst({
      where: {
        Sequence2: {
          gte: minSeqForDepots,
          lte: maxSeqForDepots,
        },
      },
      orderBy: { Sequence2: "desc" },
    });

    let Sequence1;
    if (lastSequenceDepot && lastSequenceDepot.Sequence2) {
      Sequence1 = lastSequenceDepot.Sequence2 + 1;
    } else {
      Sequence1 = minSeqForDepots + 1; // Start of the year for depots: 2680001
    }

    let Sequence2 = Sequence1 + invoicesCount - 1;

    if (Sequence2 > maxSeqForDepots) {
      return NextResponse.json(
        { error: "Depot sequence overflow for current year." },
        { status: 400 },
      );
    }

    const newItem = await prisma.depots.create({
      data: {
        depot_name,
        depot_code: newCode,
        location: location || null,
        manager_name: manager_name || null,
        contact_number: contact_number || null,
        traderId: traderId ? parseInt(traderId) : null,
        Sequence1,
        Sequence2,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        trader: true,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating depot:", error);
    return NextResponse.json(
      { error: "Error creating depot" },
      { status: 500 },
    );
  }
}
