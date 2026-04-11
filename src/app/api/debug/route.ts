import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, any> = {};

    // Dynamic env var access (webpack cannot inline bracket notation)
      const envKeys = ["DATABASE_URL", "NEXTAUTH_SECRET", "AUTH_SECRET", "NEXTAUTH_URL", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "NODE_ENV", "PORT", "HOSTNAME"];
        checks.envDynamic = {};
          for (const key of envKeys) {
              checks.envDynamic[key] = !!process.env[key];
                }

                  // Static env var access (may be inlined by webpack at build time)
                    checks.envStatic = {
                        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
                            GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
                                DATABASE_URL: !!process.env.DATABASE_URL,
                                    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "(not set)",
                                        NODE_ENV: process.env.NODE_ENV,
                                          };

                                            // Dump ALL env var keys (not values) to see what DO injects
                                              checks.allEnvKeys = Object.keys(process.env).sort();

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

                                                                                                              // Try to import auth config
                                                                                                                try {
                                                                                                                    const auth = require("@/lib/auth");
                                                                                                                        checks.authModule = { importOk: true, keys: Object.keys(auth) };
                                                                                                                          } catch (e: any) {
                                                                                                                              checks.authModule = { importOk: false, error: e.message, stack: e.stack?.substring(0, 500) };
                                                                                                                                }

                                                                                                                                  return NextResponse.json(checks, { status: 200 });
                                                                                                                                  }