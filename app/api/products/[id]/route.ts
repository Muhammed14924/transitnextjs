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
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const product = await prisma.comp_items.findUnique({
      where: { id: productId },
      include: {
        companies: {
          select: { company_name: true },
        },
        units: {
          select: { unit_name: true },
        },
        typeofitems: {
          select: { item_type: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product Detail API GET error:", error);
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
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await prisma.comp_items.update({
      where: { id: productId },
      data: {
        item_ar_name: body.item_ar_name,
        item_en_name: body.item_en_name,
        internal_code: body.internal_code,
        company_name: body.company_name,
        item_code: body.item_code,
        weight: body.weight,
        package: body.package,
        packet_weight: body.packet_weight,
        unit: body.unit,
        price: body.price,
        ismain_item: body.ismain_item,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Product Detail API PATCH error:", error);
    return NextResponse.json(
      { error: "Error updating product" },
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
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.comp_items.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product Detail API DELETE error:", error);
    return NextResponse.json(
      { error: "Error deleting product" },
      { status: 500 },
    );
  }
}
