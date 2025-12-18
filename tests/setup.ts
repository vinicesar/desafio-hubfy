import "dotenv/config";
import prisma from "@/lib/db";


afterAll(async () => {
  await prisma.$disconnect();
});