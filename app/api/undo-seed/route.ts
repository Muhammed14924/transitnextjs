import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET() {
  try {
    const itemsData = [
  { subItem: "ميني ملكة 7غ×100×6", mainItem: null },
  { subItem: "كابتشينو هوت دروبس", mainItem: null },
  { subItem: "كابتشينو فريش", mainItem: null },
  { subItem: "قهوة فريش 3*1", mainItem: null },
  { subItem: "قهوة غولد 2غ×48×12", mainItem: null },
  { subItem: "قهوة سريعة بالهال 2غ", mainItem: null },
  { subItem: "قهوة سريعة 2غ", mainItem: null },
  { subItem: "فول بار فستق 35غ", mainItem: null },
  { subItem: "فول بار  35غ بسكويت", mainItem: null },
  { subItem: "فريش كيس 16غ×50×20", mainItem: null },
  { subItem: "قهوة سريعة هوت دروبس 2غ", mainItem: null },
  { subItem: "شوكولا ملكة ستيك 28غ", mainItem: null },
  { subItem: "شوكولا مادلين 352غ×6", mainItem: null },
  { subItem: "شوكولا عمار كريسبي 50غ", mainItem: null },
  { subItem: "شوكولا عمار دهن 850غ", mainItem: null },
  { subItem: "شوكولا عمار بيتر 50غ", mainItem: null },
  { subItem: "شوكولا عمار بيتر 30غ", mainItem: null },
  { subItem: "شوكولا عمار بندق 27 غ", mainItem: null },
  { subItem: "شوكولا عمار 7 غ بيتر", mainItem: "شوكولا عمار 7غ" },
  { subItem: "شوكولا عمار 1كغ", mainItem: "شوكولا عمار 1كغ" },
  { subItem: "شوكولا عمار ", mainItem: "شوكولا عمار " },
  { subItem: "شوكولا بيتر 5X ", mainItem: null },
  { subItem: "شوكولا بالفستق 50غ", mainItem: null },
  { subItem: "شوكولا 25غ  X5", mainItem: "شوكولا 25غ  X5" },
  { subItem: "شوكولا مادلين 1كغ×6", mainItem: "شوكولا عمار 1كغ" },
  { subItem: "شراب فريش مشكل", mainItem: "شراب فريش 10غ×48×8" },
  { subItem: "شراب فريش مانجو", mainItem: "شراب فريش 10غ×48×8" },
  { subItem: "شراب فريش ليمون", mainItem: "شراب فريش 10غ×48×8" },
  { subItem: "شراب فريش عرض", mainItem: "شراب فريش 10غ×48×8" },
  { subItem: "شراب فريش رمان", mainItem: "شراب فريش 10غ×48×8" },
  { subItem: "شراب فريش خوخ", mainItem: "شراب فريش 10غ×48×8" },
  { subItem: "شراب فريش توت", mainItem: "شراب فريش 10غ×48×8" },
  { subItem: "شراب فريش اناناس", mainItem: "شراب فريش 10غ×48×8" },
  { subItem: "شراب فريش كولا", mainItem: "شراب فريش 10غ×48×8" },
  { subItem: "شراب فريش تفاح", mainItem: "شراب فريش 10غ×48×8" },
  { subItem: "شراب فريش برتقال", mainItem: "شراب فريش 10غ×48×8" },
  { subItem: "ريتش كولد 2غ X48 X12", mainItem: null },
  { subItem: "حلاوة عمار 700غ كاكاو", mainItem: null },
  { subItem: "حلاوة عمار 700غ سادة", mainItem: null },
  { subItem: "حلاوة عمار 350غ فستق", mainItem: null },
  { subItem: "حلاوة عمار 350غ سادة", mainItem: null },
  { subItem: "حلاوة عمار 200غ فستق", mainItem: "حلاوة عمار 200غ سادة" },
  { subItem: "حلاوة عمار 200غ سادة", mainItem: "حلاوة عمار 200غ سادة" },
  { subItem: "توفي 40غ كاكاو", mainItem: "توفي عمار 40غ" },
  { subItem: "توفي 40غ حليب", mainItem: "توفي عمار 40غ" },
  { subItem: "توفي 40غ توت", mainItem: "توفي عمار 40غ" },
  { subItem: "توفي 40غ برتقال", mainItem: "توفي عمار 40غ" },
  { subItem: "بسكويت كلاسيك 60غ", mainItem: null },
  { subItem: "بسكويت فيت بار كاكاو 27غ", mainItem: null },
  { subItem: "بسكويت فيت بار 27غ", mainItem: null },
  { subItem: "بسكويت علي بابا 30غ X 24", mainItem: null }
    ];

    const namesToDelete = new Set<string>();
    itemsData.forEach(i => {
      namesToDelete.add(i.subItem);
      if (i.mainItem) namesToDelete.add(i.mainItem);
    });

    const deleted = await prisma.comp_items.deleteMany({
      where: {
        item_ar_name: {
          in: Array.from(namesToDelete)
        }
      }
    });

    // Fix sequences
    const companies = await prisma.companies.findMany();
    for (const company of companies) {
      const items = await prisma.comp_items.findMany({
        where: { company_name: company.id },
        orderBy: { id: "asc" },
        include: { typeofitems: true }
      });

      if (items.length === 0) continue;

      let currentInternalCode = company.first_internal_serial;
      let currentItemCode = 1;

      for (const item of items) {
        const typeCode = item.typeofitems?.typecode || "000";
        const formattedItemCode = String(currentItemCode).padStart(4, "0");
        const newCompositeCode = `${company.company_code}-${typeCode}-${formattedItemCode}`;

        await prisma.comp_items.update({
          where: { id: item.id },
          data: {
            internal_code: currentInternalCode,
            item_code: currentItemCode,
            composite_code: newCompositeCode
          }
        });

        currentInternalCode++;
        currentItemCode++;
      }
    }

    return NextResponse.json({ success: true, deletedCount: deleted.count, message: "Reverted and sequences fixed!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
