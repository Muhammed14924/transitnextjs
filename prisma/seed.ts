import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ⚠️ هام: تأكد أن رقم 1 هو الـ ID الخاص بشركة أورجينال في جدول companies
const ORIGINAL_COMPANY_ID = 3;

// البيانات المستخرجة بدقة من ملف الإكسيل الذي أرفقته
const itemsData = [
  { subItem: "كوبرا طاقة 185مل×30", mainItem: null },
  { subItem: "عصير مانجو تنك 240مل", mainItem: "عصير اورجينال تنك 240مل×24" },
  { subItem: "عصير دراق تنك 240مل", mainItem: "عصير اورجينال تنك 240مل×24" },
  { subItem: "عصير برتقال تنك 240مل", mainItem: "عصير اورجينال تنك 240مل×24" },
  {
    subItem: "عصير اورجينال برتقال و جزر 1.4 لتر",
    mainItem: "عصير اورجينال 1.4 لتر",
  },
  { subItem: "عصير اورجينال 800 مل مانجو", mainItem: "عصير اورجينال 800 مل" },
  {
    subItem: "عصير اورجينال 800 مل برتقال+جزر",
    mainItem: "عصير اورجينال 800 مل",
  },
  { subItem: "عصير اورجينال 800 مل", mainItem: "عصير اورجينال 800 مل" },
  { subItem: "عصير اورجينال 1.4 لتر", mainItem: "عصير اورجينال 1.4 لتر" },
  { subItem: "عصير اناناس تنك 240مل", mainItem: "عصير اورجينال تنك 240مل×24" },
  { subItem: "اورجينال مانجو 250مل×30", mainItem: "اورجينال بلاستيك 250مل×30" },
  { subItem: "اورجينال مانجو 250مل×27", mainItem: "اورجينال كرتون 250مل×27" },
  { subItem: "اورجينال كرتون 250مل×27", mainItem: "اورجينال كرتون 250مل×27" },
  { subItem: "اورجينال قهوة 240مل×24", mainItem: null },
  { subItem: "اورجينال فواكه 250مل×27", mainItem: "اورجينال كرتون 250مل×27" },
];

async function main() {
  console.log("⏳ جاري بدء استيراد أصناف شركة أورجينال...");

  // جلب أعلى رقم تسلسلي موجود في قاعدة البيانات لنكمل العد بعده
  const lastItem = await prisma.comp_items.findFirst({
    orderBy: { internal_code: "desc" },
  });

  let currentInternalCode = lastItem ? lastItem.internal_code + 1 : 1000000;
  let currentItemCode = lastItem ? lastItem.item_code + 1 : 1;

  // خريطة لحفظ IDs الأصناف الرئيسية لربطها بالفرعية
  const mainItemsMap = new Map<string, number>();

  // 1. استخراج وإنشاء الأصناف الرئيسية (التي ذكرت في العمود الأيسر، أو التي ليس لها أب)
  const mainItemNames = new Set<string>();
  itemsData.forEach((item) => {
    if (item.mainItem) mainItemNames.add(item.mainItem);
    if (!item.mainItem || item.subItem === item.mainItem)
      mainItemNames.add(item.subItem);
  });

  for (const mainName of Array.from(mainItemNames)) {
    const existing = await prisma.comp_items.findFirst({
      where: { item_ar_name: mainName, company_name: ORIGINAL_COMPANY_ID },
    });

    if (!existing) {
      const createdMain = await prisma.comp_items.create({
        data: {
          internal_code: currentInternalCode++,
          item_code: currentItemCode++,
          item_ar_name: mainName,
          ismain_item: true,
          company_name: ORIGINAL_COMPANY_ID,
          unit: 1,
        },
      });
      mainItemsMap.set(mainName, createdMain.id);
      console.log(`✅ تم إنشاء الصنف الرئيسي: ${mainName}`);
    } else {
      mainItemsMap.set(mainName, existing.id);
    }
  }

  // 2. إنشاء الأصناف الفرعية (النكهات) وربطها بآبائها
  for (const data of itemsData) {
    // تخطي الصنف إذا كان هو نفسه الصنف الرئيسي (تجنب التكرار)
    if (!data.mainItem || data.subItem === data.mainItem) continue;

    const existingSub = await prisma.comp_items.findFirst({
      where: { item_ar_name: data.subItem, company_name: ORIGINAL_COMPANY_ID },
    });

    if (!existingSub) {
      const parentId = mainItemsMap.get(data.mainItem);

      await prisma.comp_items.create({
        data: {
          internal_code: currentInternalCode++,
          item_code: currentItemCode++,
          item_ar_name: data.subItem,
          ismain_item: false,
          main_item: parentId, // الربط بالصنف الرئيسي
          company_name: ORIGINAL_COMPANY_ID,
          unit: 1,
        },
      });
      console.log(`➡️ تم إضافة الصنف الفرعي: ${data.subItem}`);
    }
  }

  console.log("🎉 تم استيراد جميع الأصناف بنجاح وإعداد العلاقات بينها!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
