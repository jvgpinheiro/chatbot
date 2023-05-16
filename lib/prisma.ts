import { PrismaClient } from "@prisma/client";

export type GlobalThisWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  const castedGlobal = global as GlobalThisWithPrisma;
  if (!castedGlobal.prisma) {
    castedGlobal.prisma = new PrismaClient();
  }
  prisma = castedGlobal.prisma;
}

export default prisma;
