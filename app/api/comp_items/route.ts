import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const items = await prisma.comp_items.findMany({
      include: {
        companies: true,
        typeofitems: true,
        units: true,
        parent_item: true, // Fetch main item details if exists
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "Error fetching items" },
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
      item_ar_name,
      item_en_name,
      company_name,
      item_type,
      unit,
      price,
      weight,
      package: pkg,
      packet_weight,
      ismain_item,
      main_item,
      isActive,
      date_exp,
      GTIP,
      image,
      manufacturer_code,
    } = body;

    // 1. Fetch Company Info
    const company = await prisma.companies.findUnique({
      where: { id: parseInt(company_name) },
    });
    if (!company) throw new Error("Company not found");

    // 2. Fetch Item Type Info
    let typeCode = "000";
    if (item_type) {
      const typeInfo = await prisma.typeofitems.findUnique({
        where: { id: parseInt(item_type) },
      });
      if (typeInfo) typeCode = typeInfo.typecode;
    }

    // 3. Generate internal_code
    const lastInternalCodeItem = await prisma.comp_items.findFirst({
      where: { company_name: parseInt(company_name) },
      orderBy: { internal_code: "desc" },
    });

    const internal_code =
      lastInternalCodeItem && lastInternalCodeItem.internal_code
        ? lastInternalCodeItem.internal_code + 1
        : company.first_internal_serial;

    // 4. Generate item_code (Sequence within company)
    const lastItemCode = await prisma.comp_items.findFirst({
      where: { company_name: parseInt(company_name) },
      orderBy: { item_code: "desc" },
    });

    const item_code =
      lastItemCode && lastItemCode.item_code ? lastItemCode.item_code + 1 : 1;

    // 5. Build composite_code: CompanyCode - TypeCode - ItemCode(4 digits)
    const formattedItemCode = String(item_code).padStart(4, "0");
    const composite_code = `${company.company_code}-${typeCode}-${formattedItemCode}`;

    // Create item
    const newItem = await prisma.comp_items.create({
      data: {
        item_ar_name,
        item_en_name: item_en_name || null,
        company_name: parseInt(company_name),
        item_type: item_type ? parseInt(item_type) : null,
        unit: unit ? parseInt(unit) : 1,
        price: price ? parseFloat(price) : 0,
        weight: weight ? parseFloat(weight) : 0,
        package: pkg || null,
        packet_weight: packet_weight ? parseFloat(packet_weight) : 0,
        date_exp: date_exp ? new Date(date_exp) : null,
        GTIP: GTIP ? parseInt(GTIP) : null,
        image: image || null,
        manufacturer_code: manufacturer_code || null,
        ismain_item: ismain_item || false,
        main_item: !ismain_item && main_item ? parseInt(main_item) : null,
        internal_code,
        item_code,
        composite_code,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: { companies: true, typeofitems: true, units: true },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating item:", error);
    const message = error instanceof Error ? error.message : "Error creating item";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
