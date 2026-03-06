import { prisma } from "./app/lib/db";

prisma.destination
  .findMany()
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
