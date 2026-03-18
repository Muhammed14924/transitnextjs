import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const waybillId = parseInt(id);

    const waybill = await prisma.trip_waybills.findUnique({
      where: { id: waybillId },
      include: {
        sender_company: true,
        trader: true,
        destination: true,
        invoice_items: {
          include: {
            comp_item: true,
            unit: true,
          },
        },
      },
    });

    if (!waybill) {
      return NextResponse.json({ error: "Waybill not found" }, { status: 404 });
    }

    return NextResponse.json(waybill);
  } catch (error) {
    console.error("GET Invoice Items Error:", error);
    const message = error instanceof Error ? error.message : "Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const waybillId = parseInt(id);
    const body = await req.json();
    const { items } = body; // items: Array<{ comp_item_id, unit_id, quantity, notes }>

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Items must be an array" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete existing items
      await tx.invoice_items.deleteMany({
        where: { waybill_id: waybillId },
      });

      // 2. Insert new items if any
      if (items.length > 0) {
        await tx.invoice_items.createMany({
          data: items.map((item: { comp_item_id: string; unit_id?: string; quantity?: number; notes?: string }) => ({
            waybill_id: waybillId,
            comp_item_id: parseInt(item.comp_item_id),
            unit_id: item.unit_id ? parseInt(item.unit_id) : null,
            quantity: item.quantity ? parseInt(item.quantity.toString()) : 1,
            notes: item.notes || null,
          })),
        });
      }

      // 3. Update parent record total_invoice_items
      await tx.trip_waybills.update({
        where: { id: waybillId },
        data: {
          total_invoice_items: items.length,
        },
      });
    });

    return NextResponse.json({ success: true, count: items.length });
  } catch (error) {
    console.error("POST Invoice Items Sync Error:", error);
    return NextResponse.json({ error: "Failed to save invoice items" }, { status: 500 });
  }
}
