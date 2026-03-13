import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const items = await prisma.companies.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "Error fetching companies" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { company_name, compen, place, expected_invoices, isActive, logo } =
      body;

    const invoicesCount = parseInt(expected_invoices) || 1000;

    // 1. Generate Company Code (001, 002...) & Internal Serial (1000000, 1001000...)
    const lastCompany = await prisma.companies.findFirst({
      orderBy: { id: "desc" },
    });

    let nextCodeNum = 1;
    let nextInternalSerial = 1000000;

    if (lastCompany) {
      nextCodeNum = parseInt(lastCompany.company_code) + 1;
      nextInternalSerial = lastCompany.first_internal_serial + 1000; // Allocate 1000 items per company
    }
    const company_code = String(nextCodeNum).padStart(3, "0");

    // 2. Generate Invoice Sequences Based on Current Year
    const currentYearStr = new Date().getFullYear().toString().slice(-2); // e.g., "26"

    // Define bounds for normal companies (leave 80000+ for depots)
    const minSeqForYear = parseInt(`${currentYearStr}00000`); // e.g., 2600000
    const maxSeqForYear = parseInt(`${currentYearStr}79999`); // e.g., 2679999

    // Find the last sequence used THIS YEAR
    const lastSequenceCompany = await prisma.companies.findFirst({
      where: {
        Sequence2: {
          gte: minSeqForYear,
          lte: maxSeqForYear,
        },
      },
      orderBy: { Sequence2: "desc" },
    });

    let Sequence1;
    if (lastSequenceCompany && lastSequenceCompany.Sequence2) {
      Sequence1 = lastSequenceCompany.Sequence2 + 1;
    } else {
      Sequence1 = parseInt(`${currentYearStr}00001`); // Start of the year
    }

    const Sequence2 = Sequence1 + invoicesCount - 1;

    // Safety check: Prevent overflowing into Depot sequences (80000+)
    if (Sequence2 > maxSeqForYear) {
      return NextResponse.json(
        {
          error:
            "Sequence overflow for current year. Exceeded limit before depot sequences.",
        },
        { status: 400 },
      );
    }

    const item = await prisma.companies.create({
      data: {
        company_name,
        compen: compen || null,
        place: place || null,
        company_code,
        Sequence1,
        Sequence2,
        first_internal_serial: nextInternalSerial,
        isActive: isActive !== undefined ? isActive : true,
        logo: logo || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating company:", error);
    const message = error instanceof Error ? error.message : "Error creating company";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
