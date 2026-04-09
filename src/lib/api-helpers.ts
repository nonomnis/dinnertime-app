import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { auth } from "./auth";
import { prisma } from "./prisma";

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  familyId?: string;
  role?: string;
}

/**
 * Get the current authenticated user from the session
 * Throws 401 if not authenticated
 */
export async function getCurrentUser(req?: NextRequest): Promise<SessionUser> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return {
    id: session.user.id || "",
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    familyId: (session.user as any).familyId,
    role: (session.user as any).role,
  };
}

/**
 * Get the user's active family membership
 * Returns family + member info, or throws 401 if user not in a family
 */
export async function getCurrentFamily(userId: string) {
  const familyMember = await prisma.familyMember.findFirst({
    where: {
      userId,
      family: {
        isActive: true,
      },
    },
    include: {
      family: {
        include: {
          members: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  if (!familyMember) {
    throw new Error("User not in an active family");
  }

  return {
    family: familyMember.family,
    member: familyMember,
    role: familyMember.role,
  };
}

/**
 * Return a JSON response
 */
export function jsonResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Return an error JSON response
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      error: message,
    },
    { status }
  );
}

/**
 * Validate request body against a Zod schema
 * Returns parsed data or throws with detailed error
 */
export async function validateBody<T>(schema: ZodSchema, body: unknown): Promise<T> {
  try {
    return schema.parse(body) as T;
  } catch (error: any) {
    if (error.errors) {
      throw new Error(`Validation failed: ${error.errors.map((e: any) => e.message).join(", ")}`);
    }
    throw new Error("Invalid request body");
  }
}

/**
 * Check if family member has the required role
 * Throws 403 if not authorized
 */
export async function requireRole(
  familyMemberId: string,
  requiredRole: "ADMIN" | "MEMBER" | "GUEST"
): Promise<void> {
  const member = await prisma.familyMember.findUnique({
    where: { id: familyMemberId },
  });

  if (!member) {
    throw new Error("Family member not found");
  }

  const roles = ["GUEST", "MEMBER", "ADMIN"];
  const memberRoleIndex = roles.indexOf(member.role);
  const requiredRoleIndex = roles.indexOf(requiredRole);

  if (memberRoleIndex < requiredRoleIndex) {
    throw new Error("Insufficient permissions");
  }
}
