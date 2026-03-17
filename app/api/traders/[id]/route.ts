import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const traderId = parseInt(id);

    if (isNaN(traderId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const trader = await prisma.traders.findUnique({
      where: { id: traderId },
    });

    if (!trader) {
      return NextResponse.json({ error: "Trader not found" }, { status: 404 });
    }

    return NextResponse.json(trader);
  } catch (error) {
    console.error("Trader Detail API GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const traderId = parseInt(id);
    if (isNaN(traderId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    const {
      trader_name,
      contact_person,
      phone,
      email,
      address,
      tax_number,
      opening_balance,
      credit_limit,
      isActive,
    } = body;

    const updated = await prisma.traders.update({
      where: { id: traderId },
      data: {
        trader_name: trader_name !== undefined ? trader_name : undefined,
        contact_person:
          contact_person !== undefined ? contact_person : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        address: address !== undefined ? address : undefined,
        tax_number: tax_number !== undefined ? tax_number : undefined,
        opening_balance:
          opening_balance !== undefined
            ? parseFloat(opening_balance)
            : undefined,
        credit_limit:
          credit_limit !== undefined
            ? credit_limit
              ? parseFloat(credit_limit)
              : null
            : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Trader Detail API PATCH error:", error);
    return NextResponse.json(
      { error: "Error updating trader" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const traderId = parseInt(id);
    if (isNaN(traderId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.traders.delete({
      where: { id: traderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Trader Detail API DELETE error:", error);
    return NextResponse.json(
      { error: "Error deleting trader" },
      { status: 500 },
    );
  }
}
