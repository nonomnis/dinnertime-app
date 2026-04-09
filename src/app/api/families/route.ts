import { NextRequest } from "next/server";
import {
  getCurrentUser,
  getCurrentFamily,
  jsonResponse,
  errorResponse,
  validateBody,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createFamilySchema = z.object({
  name: z.string().min(1, "Family name is required"),
});

/**
 * POST /api/families
 * Create a new family. Auto-adds creator as PARENT member.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const { name } = await validateBody(createFamilySchema, body);

    // Create the family
    const family = await prisma.family.create({
      data: {
        name,
        createdById: user.id,
        memberCount: 1,
      },
      include: {
        members: {
          where: { isActive: true },
        },
      },
    });

    // Add creator as PARENT member
    const member = await prisma.familyMember.create({
      data: {
        familyId: family.id,
        userId: user.id,
        role: "PARENT",
      },
    });

    return jsonResponse({
      family,
      member,
      message: "Family created successfully",
    }, 201);
  } catch (error: any) {
    console.error("Error creating family:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to create family", 400);
  }
}

/**
 * GET /api/families
 * Get current user's families (list all families they belong to)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    // Get all families user belongs to
    const memberships = await prisma.familyMember.findMany({
      where: {
        userId: user.id,
        isActive: true,
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

    const families = memberships.map((m) => ({
      ...m.family,
      userRole: m.role,
    }));

    return jsonResponse({
      families,
      count: families.length,
    });
  } catch (error: any) {
    console.error("Error fetching families:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch families", 400);
  }
}
