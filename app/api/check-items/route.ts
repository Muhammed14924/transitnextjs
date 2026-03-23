import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const akanlarItems = await prisma.comp_items.findMany({
    where: { company_name: 8 }
  });
  
  const originalItems = await prisma.comp_items.findMany({
    where: { company_name: 3 },
    orderBy: { id: "desc" },
    take: 50
  });

  return NextResponse.json({
    akanlarCount: akanlarItems.length,
    recentOriginals: originalItems.map(i => ({ id: i.id, name: i.item_ar_name }))
  });
}
