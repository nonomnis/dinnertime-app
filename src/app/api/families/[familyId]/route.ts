import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
  validateBody,
  requireRole,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateFamilySchema = z.object({
  name: z.string().optional(),
  lockInDays: z.number().int().min(0).max(14).optional(),
  defaultEatOutDay: z.number().int().min(0).max(6).nullable().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
});

/**
 * GET /api/families/[familyId]
 * Get family details with members
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { familyId } = params;

    // Verify user belongs to family
    const membership = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return errorResponse("Family not found or access denied", 403);
    }

    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!family) {
      return errorResponse("Family not found", 404);
    }

    return jsonResponse({ family });
  } catch (error: any) {
    console.error("Error fetching family:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch family", 400);
  }
}

/**
 * PATCH /api/families/[familyId]
 * Update family settings. PARENT only.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { familyId } = params;

    // Verify user is PARENT
    const membership = await prisma.familyMember.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return errorResponse("Family not found or access denied", 403);
    }

    await requireRole(membership.id, "PARENT");

    const body = await req.json();
    const updates = await validateBody(updateFamilySchema, body);

    const family = await prisma.family.update({
      where: { id: familyId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.lockInDays !== undefined && { lockInDays: updates.lockInDays }),
        ...(updates.defaultEatOutDay !== undefined && { defaultEatOutDay: updates.defaultEatOutDay }),
        ...(updates.dietaryRestrictions && { dietaryRestrictions: updates.dietaryRestrictions }),
        updatedAt: new Date(),
      },
      include: {
        members: {
          where: { isActive: true },
        },
      },
    });

    return jsonResponse({ family, message: "Family updated successfully" });
  } catch (error: any) {
    console.error("Error updating family:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can update family settings", 403);
    }
    return errorResponse(error.message || "Failed to update family", 400);
  }
}
