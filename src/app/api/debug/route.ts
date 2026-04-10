import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, any> = {};

  // Check env vars (show presence, not values)
  checks.env = {
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "(not set)",
    NODE_ENV: process.env.NODE_ENV,
  };

  // Check Prisma
  try {
    const { PrismaClient } = require("@prisma/client");
    checks.prisma = { importOk: true, type: typeof PrismaClient };
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      checks.prisma.connectOk = true;
      await prisma.$disconnect();
    } catch (e: any) {
      checks.prisma.connectError = e.message;
    }
  } catch (e: any) {
    checks.prisma = { importOk: false, error: e.message };
  }

  // Check PrismaAdapter
  try {
    const { PrismaAdapter } = require("@auth/prisma-adapter");
    checks.prismaAdapter = { importOk: true, type: typeof PrismaAdapter };
  } catch (e: any) {
    checks.prismaAdapter = { importOk: false, error: e.message };
  }

  // Check NextAuth
  try {
    const NextAuth = require("next-auth");
    checks.nextAuth = { importOk: true, type: typeof NextAuth, keys: Object.keys(NextAuth) };
  } catch (e: any) {
    checks.nextAuth = { importOk: false, error: e.message };
  }

  // Try to import auth config
  try {
    const auth = require("@/lib/auth");
    checks.authModule = { importOk: true, keys: Object.keys(auth) };
  } catch (e: any) {
    checks.authModule = { importOk: false, error: e.message, stack: e.stack?.substring(0, 500) };
  }

  return NextResponse.json(checks, { status: 200 });
}
