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
      manufacturer_code,
      item_type,
      unit,
    } = body;

    // Fetch existing item to check for changes
    const existingItem = await prisma.comp_items.findUnique({
      where: { id: Number(id) },
      include: { companies: true },
    });
    if (!existingItem) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    let composite_code = undefined;
    const newItemType = item_type === "" ? null : (item_type !== undefined ? Number(item_type) : existingItem.item_type);
    
    if (newItemType !== existingItem.item_type) {
      // item_type changed, regenerate composite_code
      let typeCode = "000";
      if (newItemType) {
        const typeInfo = await prisma.typeofitems.findUnique({
          where: { id: newItemType },
        });
        if (typeInfo) typeCode = typeInfo.typecode;
      }
      const formattedItemCode = String(existingItem.item_code).padStart(4, "0");
      composite_code = `${existingItem.companies.company_code}-${typeCode}-${formattedItemCode}`;
    }

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
        manufacturer_code:
          manufacturer_code !== undefined ? manufacturer_code || null : undefined,
        ismain_item: ismain_item !== undefined ? ismain_item : undefined,
        main_item: 
          ismain_item === true ? null : 
          main_item !== undefined ? (main_item ? parseInt(main_item) : null) : 
          undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        item_type: item_type !== undefined ? (item_type ? parseInt(item_type) : null) : undefined,
        unit: unit !== undefined ? (unit ? parseInt(unit) : 1) : undefined,
        composite_code,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error: unknown) {
    console.error("Error updating item:", error);
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
  } catch {
    return NextResponse.json(
      { error: "Cannot delete item. It has dependencies." },
      { status: 500 },
    );
  }
}
