import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

export const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error) {
    console.log("Error connecting to database: ", error);
    process.exit(1);
  }
};

export default prisma;
