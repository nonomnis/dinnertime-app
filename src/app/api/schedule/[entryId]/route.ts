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

const updateScheduleEntrySchema = z.object({
  foodOptionId: z.string().optional(),
  overrideNote: z.string().optional(),
});

/**
 * GET /api/schedule/[entryId]
 * Get single entry with votes and food details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { entryId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { entryId } = params;

    // Get user's family
    const membership = await prisma.familyMember.findFirst({
      where: {
        userId: user.id,
        family: { isActive: true },
      },
    });

    if (!membership) {
      return errorResponse("User not in an active family", 403);
    }

    const entry = await prisma.scheduleEntry.findUnique({
      where: { id: entryId },
      include: {
        foodOption: {
          include: {
            ingredients: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            foodOption: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        feedback: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!entry || entry.familyId !== membership.familyId) {
      return errorResponse("Schedule entry not found or access denied", 404);
    }

    return jsonResponse({ entry });
  } catch (error: any) {
    console.error("Error fetching schedule entry:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch schedule entry", 400);
  }
}

/**
 * PATCH /api/schedule/[entryId]
 * Update schedule entry. PARENT override: set foodOptionId, overrideNote. Auto-locks the entry.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { entryId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { entryId } = params;

    // Get user's family and verify PARENT
    const membership = await prisma.familyMember.findFirst({
      where: {
        userId: user.id,
        family: { isActive: true },
      },
    });

    if (!membership) {
      return errorResponse("User not in an active family", 403);
    }

    await requireRole(membership.id, "PARENT");

    const familyId = membership.familyId;

    // Get entry
    const entry = await prisma.scheduleEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.familyId !== familyId) {
      return errorResponse("Schedule entry not found or access denied", 404);
    }

    const body = await req.json();
    const { foodOptionId, overrideNote } = await validateBody(updateScheduleEntrySchema, body);

    // Verify food option belongs to family if provided
    if (foodOptionId) {
      const food = await prisma.foodOption.findUnique({
        where: { id: foodOptionId },
      });

      if (!food || food.familyId !== familyId) {
        return errorResponse("Food option not found or not in this family", 404);
      }
    }

    // Update entry and lock it
    const updated = await prisma.scheduleEntry.update({
      where: { id: entryId },
      data: {
        ...(foodOptionId && { foodOptionId }),
        ...(overrideNote !== undefined && { overrideNote }),
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: "PARENT_OVERRIDE",
        overriddenById: user.id,
      },
      include: {
        foodOption: true,
      },
    });

    return jsonResponse({
      entry: updated,
      message: "Schedule entry updated and locked",
    });
  } catch (error: any) {
    console.error("Error updating schedule entry:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can override schedule entries", 403);
    }
    return errorResponse(error.message || "Failed to update schedule entry", 400);
  }
}
