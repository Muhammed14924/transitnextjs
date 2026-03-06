import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const items = await prisma.transport_company.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching transport companies" },
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
    const {
      trans_name,
      contact_person,
      phone,
      email,
      transport_type,
      opening_balance,
      isActive,
    } = body;

    const item = await prisma.transport_company.create({
      data: {
        trans_name,
        contact_person: contact_person || null,
        phone: phone || null,
        email: email || null,
        transport_type: transport_type || null,
        opening_balance: opening_balance ? parseFloat(opening_balance) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating transport company" },
      { status: 500 },
    );
  }
}
