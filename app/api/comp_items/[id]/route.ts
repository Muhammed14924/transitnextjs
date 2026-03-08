import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id } = await params;

    const {
      item_ar_name,
      item_en_name,
      price,
      weight,
      package: pkg,
      packet_weight,
      isActive,
      ismain_item,
      main_item,
      date_exp,
      GTIP,
      image,
    } = body;

    const updatedItem = await prisma.comp_items.update({
      where: { id: Number(id) },
      data: {
        item_ar_name,
        item_en_name: item_en_name || null,
        price: price !== undefined ? parseFloat(price) : undefined,
        weight: weight !== undefined ? parseFloat(weight) : undefined,
        package: pkg || null,
        packet_weight:
          packet_weight !== undefined ? parseFloat(packet_weight) : undefined,
        date_exp:
          date_exp !== undefined
            ? date_exp
              ? new Date(date_exp)
              : null
            : undefined,
        GTIP: GTIP !== undefined ? (GTIP ? parseInt(GTIP) : null) : undefined,
        image: image !== undefined ? image || null : undefined,
        ismain_item: ismain_item !== undefined ? ismain_item : undefined,
        main_item: !ismain_item && main_item ? parseInt(main_item) : null,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: "Error updating item" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.comp_items.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Cannot delete item. It has dependencies." },
      { status: 500 },
    );
  }
}
