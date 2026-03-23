import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// رقم شركة أكانلار بناءً على الصورة المرفقة
const AKANLAR_COMPANY_ID = 8;
const AKANLAR_COMPANY_CODE = "006";

// البيانات (تم إزالة الصنف الأول "ميني ملكة" لأنك أدخلته يدوياً)
const itemsData = [
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
  { subItem: "بسكويت علي بابا 30غ X 24", mainItem: null },
];

// وظيفة لتخمين النوع بناءً على الاسم
function deduceType(name: string) {
  if (name.includes("شوكولا")) return { id: 12, code: "008" };
  if (name.includes("بسكويت") || name.includes("بار"))
    return { id: 4, code: "001" };
  if (name.includes("عصير") || name.includes("شراب"))
    return { id: 7, code: "003" };
  if (name.includes("قهوة") || name.includes("كابتشينو"))
    return { id: 26, code: "021" };
  if (name.includes("توفي") || name.includes("سكاكر"))
    return { id: 5, code: "002" };
  return { id: 12, code: "008" }; // افتراضي شوكولا (حسب الصورة)
}

async function main() {
  console.log("⏳ جاري استيراد أصناف شركة أكانلار بذكاء...");

  // 1. البحث الدقيق
  const lastAkanlarItem = await prisma.comp_items.findFirst({
    where: { company_name: AKANLAR_COMPANY_ID },
    orderBy: { item_code: "desc" },
  });

  let currentInternalCode = lastAkanlarItem
    ? lastAkanlarItem.internal_code + 1
    : 1005001;
  let currentItemCode = lastAkanlarItem ? lastAkanlarItem.item_code + 1 : 1;

  console.log(
    `🔢 العداد سيبدأ من: item_code=${currentItemCode}, internal_code=${currentInternalCode}`,
  );

  const mainItemsMap = new Map<string, number>();

  // 2. استخراج وإنشاء الأصناف الرئيسية (الآباء)
  const mainItemNames = new Set<string>();
  itemsData.forEach((item) => {
    if (item.mainItem) mainItemNames.add(item.mainItem);
    if (!item.mainItem || item.subItem === item.mainItem)
      mainItemNames.add(item.subItem);
  });

  for (const mainName of Array.from(mainItemNames)) {
    const existing = await prisma.comp_items.findFirst({
      where: { item_ar_name: mainName, company_name: AKANLAR_COMPANY_ID },
    });

    if (!existing) {
      const typeInfo = deduceType(mainName);
      const compositeCode = `${AKANLAR_COMPANY_CODE}-${typeInfo.code}-${String(currentItemCode).padStart(4, "0")}`;

      const createdMain = await prisma.comp_items.create({
        data: {
          internal_code: currentInternalCode++,
          item_code: currentItemCode++,
          composite_code: compositeCode,
          item_ar_name: mainName,
          ismain_item: true,
          company_name: AKANLAR_COMPANY_ID,
          item_type: typeInfo.id,
          unit: 1,
        },
      });
      mainItemsMap.set(mainName, createdMain.id);
      console.log(
        `✅ تم إنشاء الصنف الرئيسي: ${mainName} (Code: ${createdMain.item_code})`,
      );
    } else {
      mainItemsMap.set(mainName, existing.id);
    }
  }

  // 3. إنشاء الأصناف الفرعية وربطها بالآباء
  for (const data of itemsData) {
    if (!data.mainItem || data.subItem === data.mainItem) continue;

    const existingSub = await prisma.comp_items.findFirst({
      where: { item_ar_name: data.subItem, company_name: AKANLAR_COMPANY_ID },
    });

    if (!existingSub) {
      const parentId = mainItemsMap.get(data.mainItem);
      if (!parentId) {
        console.warn(`⚠️ لم يتم العثور على أب لـ: ${data.subItem}`);
        continue;
      }

      const typeInfo = deduceType(data.subItem);
      const compositeCode = `${AKANLAR_COMPANY_CODE}-${typeInfo.code}-${String(currentItemCode).padStart(4, "0")}`;

      const createdSub = await prisma.comp_items.create({
        data: {
          internal_code: currentInternalCode++,
          item_code: currentItemCode++,
          composite_code: compositeCode,
          item_ar_name: data.subItem,
          ismain_item: false,
          main_item: parentId,
          company_name: AKANLAR_COMPANY_ID,
          item_type: typeInfo.id,
          unit: 1,
        },
      });
      console.log(
        `➡️ تم إضافة الصنف الفرعي: ${data.subItem} (Code: ${createdSub.item_code})`,
      );
    }
  }

  console.log("🎉 تم استيراد أصناف أكانلار بنجاح تام وبأرقام صحيحة!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
