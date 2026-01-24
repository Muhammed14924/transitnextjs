import { hashPassword } from "@/app/lib/auth";
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Role } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
async function main() {
    console.log(" starting database seeding ....");

    // Clear existing data
    console.log("Clearing existing data...");
    await prisma.user.deleteMany({});
    await prisma.team.deleteMany({});
    console.log("Existing data cleared.");

    const teams = await Promise.all([
        prisma.team.create({
            data: {
                name: "engineering",
                description: "Engineering team",
                code: "ENG-2024"
            },
        }),
        prisma.team.create({
            data: {
                name: "marketing",
                description: "Marketing team",
                code: "MKT-2024"
            },
        }),
        prisma.team.create({
            data: {
                name: "sales",
                description: "Sales team",
                code: "SALES-2024"
            },
        })
    ]);
    //create sample users
    const sampleUsers = [

        {
            name: "John Doe",
            email: "john.doe@example.com",
            team: teams[0],
            role: Role.MANAGER,

        },
        {
            name: "Jane Doe",
            email: "jane.doe@example.com",
            team: teams[0],
            role: Role.USER,

        },
        {
            name: "Bob Smith",
            email: "bob.smith@example.com",
            role: Role.USER,
            team: teams[1],
        },
        {
            name: "Alice Johnson",
            email: "alice.johnson@example.com",
            role: Role.MANAGER,
            team: teams[1],
        },
    ];
    for (const userData of sampleUsers) {
        await prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: await hashPassword("123456"),
                role: userData.role,
                teamId: userData.team.id,
            }
        })
    }
    console.log("Database seeding completed successfully");

}

main().catch((e) => {
    console.error(e, "seed failed");
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
})
