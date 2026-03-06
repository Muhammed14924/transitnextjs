import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("جارٍ بدء عملية غرس البيانات (Seeding)...");

  // 1. تشفير كلمة المرور
  const hashedPassword = await bcrypt.hash("123456", 10);

  // 2. إنشاء المستخدم المسؤول
  console.log("محاولة إنشاء المستخدم: hosam1@gmail.com");

  const adminUser = await prisma.user.upsert({
    where: { email: "hosam1@gmail.com" },
    update: {
      name: "hosam",
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email: "hosam1@gmail.com",
      name: "hosam",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ تمت العملية بنجاح!");
  console.log("- ID:", adminUser.id);
  console.log("- Email:", adminUser.email);
  console.log("- Role:", adminUser.role);
}

main()
  .catch((e) => {
    console.error("❌ خطأ أثناء عملية الـ Seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
