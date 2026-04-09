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

const updateFoodSchema = z.object({
  name: z.string().optional(),
  category: z.enum([
    "CHICKEN",
    "BEEF",
    "PORK",
    "SEAFOOD",
    "VEGETARIAN",
    "PASTA",
    "SLOW_COOKER",
    "GRILL",
    "INTERNATIONAL",
    "FREESTYLE",
    "BREAKFAST_PREP",
  ]).optional(),
  recipeUrl: z.string().url().optional().nullable(),
  servings: z.number().int().min(1).optional(),
  prepTimeMinutes: z.number().int().min(0).optional(),
  cookTimeMinutes: z.number().int().min(0).optional(),
  dietaryTags: z.array(z.string()).optional(),
  batchYield: z.number().int().optional(),
  batchUnit: z.string().optional(),
  storageMethod: z.enum(["FRIDGE", "FREEZER", "COUNTER"]).optional().nullable(),
  shelfLifeDays: z.number().int().optional(),
  photoUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
});

/**
 * GET /api/foods/[foodId]
 * Get food option detail with ingredients, ratings, and modifier summary
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { foodId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { foodId } = params;

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

    const food = await prisma.foodOption.findUnique({
      where: { id: foodId },
      include: {
        ingredients: true,
        feedback: {
          select: {
            id: true,
            rating: true,
            action: true,
            comment: true,
            photoUrl: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        weightModifiers: {
          where: {
            expiresAt: { gt: new Date() },
            clearedAt: null,
          },
          include: {
            appliedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!food || food.familyId !== membership.familyId) {
      return errorResponse("Food option not found or access denied", 404);
    }

    return jsonResponse({
      food,
      ratings: {
        average: food.averageRating,
        total: food.totalRatings,
      },
      modifiers: food.weightModifiers,
    });
  } catch (error: any) {
    console.error("Error fetching food:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch food", 400);
  }
}

/**
 * PATCH /api/foods/[foodId]
 * Update food option. PARENT only.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { foodId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { foodId } = params;

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

    // Verify food belongs to family
    const food = await prisma.foodOption.findUnique({
      where: { id: foodId },
    });

    if (!food || food.familyId !== membership.familyId) {
      return errorResponse("Food option not found or access denied", 404);
    }

    const body = await req.json();
    const updates = await validateBody(updateFoodSchema, body);

    const updated = await prisma.foodOption.update({
      where: { id: foodId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.category && { category: updates.category }),
        ...(updates.recipeUrl !== undefined && { recipeUrl: updates.recipeUrl }),
        ...(updates.servings && { servings: updates.servings }),
        ...(updates.prepTimeMinutes !== undefined && { prepTimeMinutes: updates.prepTimeMinutes }),
        ...(updates.cookTimeMinutes !== undefined && { cookTimeMinutes: updates.cookTimeMinutes }),
        ...(updates.dietaryTags && { dietaryTags: updates.dietaryTags }),
        ...(updates.batchYield && { batchYield: updates.batchYield }),
        ...(updates.batchUnit && { batchUnit: updates.batchUnit }),
        ...(updates.storageMethod !== undefined && { storageMethod: updates.storageMethod }),
        ...(updates.shelfLifeDays !== undefined && { shelfLifeDays: updates.shelfLifeDays }),
        ...(updates.photoUrl !== undefined && { photoUrl: updates.photoUrl }),
        ...(updates.thumbnailUrl !== undefined && { thumbnailUrl: updates.thumbnailUrl }),
        updatedAt: new Date(),
      },
      include: {
        ingredients: true,
      },
    });

    return jsonResponse({ food: updated, message: "Food option updated successfully" });
  } catch (error: any) {
    console.error("Error updating food:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can update foods", 403);
    }
    return errorResponse(error.message || "Failed to update food", 400);
  }
}

/**
 * DELETE /api/foods/[foodId]
 * Archive food option (set status=ARCHIVED). PARENT only.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { foodId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { foodId } = params;

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

    // Verify food belongs to family
    const food = await prisma.foodOption.findUnique({
      where: { id: foodId },
    });

    if (!food || food.familyId !== membership.familyId) {
      return errorResponse("Food option not found or access denied", 404);
    }

    // Archive instead of delete
    const archived = await prisma.foodOption.update({
      where: { id: foodId },
      data: { status: "ARCHIVED" },
    });

    return jsonResponse({ food: archived, message: "Food option archived" });
  } catch (error: any) {
    console.error("Error archiving food:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can archive foods", 403);
    }
    return errorResponse(error.message || "Failed to archive food", 400);
  }
}
