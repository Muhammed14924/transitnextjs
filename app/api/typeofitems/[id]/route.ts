// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/db";

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     const { id } = await params;
//     const item = await prisma.typeofitems.findUnique({
//       where: { id: parseInt(id) },
//     });
//     return NextResponse.json(item);
//   } catch (error) {
//     return NextResponse.json({ error: "Error fetching" }, { status: 500 });
//   }
// }

// export async function PATCH(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     const { id } = await params;
//     const body = await req.json();
//     const item = await prisma.typeofitems.update({
//       where: { id: parseInt(id) },
//       data: body,
//     });
//     return NextResponse.json(item);
//   } catch (error) {
//     return NextResponse.json({ error: "Error updating" }, { status: 500 });
//   }
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     const { id } = await params;
//     await prisma.typeofitems.delete({ where: { id: parseInt(id) } });
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json({ error: "Error deleting" }, { status: 500 });
//   }
// }
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

    const { id } = await params;
    const body = await req.json();
    const { item_type, description, isActive } = body;

    const item = await prisma.typeofitems.update({
      where: { id: Number(id) },
      data: {
        item_type,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating item type" },
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
    if (!user || user.role === "GUEST")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.typeofitems.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting item type" },
      { status: 500 },
    );
  }
}
