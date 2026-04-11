// Use require with webpackIgnore to prevent webpack from bundling PrismaClient
// This is necessary because Next.js 14 App Router Route Handlers bundle all imports
const { PrismaClient } = require(/* webpackIgnore: true */ "@prisma/client");

const globalForPrisma = global as unknown as { prisma: InstanceType<typeof PrismaClient> };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
