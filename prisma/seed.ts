import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "../app/lib/permissions";

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

  await seedPermissions();
}

async function seedPermissions() {
  console.log("Seeding permissions...");
  
  let count = 0;
  for (const perm of Object.values(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { name: perm },
      update: {},
      create: { name: perm }
    });
    count++;
  }
  console.log(`Seeded ${count} permissions.`);

  for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    for (const permissionName of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName }
      });
      
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            role_permissionId: {
              role: role as Role,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            role: role as Role,
            permissionId: permission.id
          }
        });
      }
    }
  }
  console.log("Seeded role permissions.");
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
