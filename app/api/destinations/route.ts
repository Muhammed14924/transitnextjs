import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const items = await prisma.destination.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching destinations" },
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
    const { destination_name, destination_type, isActive } = body;

    const item = await prisma.destination.create({
      data: {
        destination_name,
        destination_type: destination_type || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating destination" },
      { status: 500 },
    );
  }
}
