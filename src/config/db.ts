import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["warn", "error"], // 👈 optional logging
});

async function connectPrisma() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected to the database!");
  } catch (err) {
    console.error("❌ Prisma failed to connect:", err);
    process.exit(1); // stop the app if db fails
  }
}

export { prisma, connectPrisma };
