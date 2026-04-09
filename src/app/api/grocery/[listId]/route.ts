import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
  validateBody,
  requireRole,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { updateGroceryListStatus } from "@/lib/grocery-engine";
import { z } from "zod";

const updateGroceryListSchema = z.object({
  status: z.enum(["DRAFT", "APPROVED", "SHOPPING", "COMPLETED"]).optional(),
});

/**
 * PATCH /api/grocery/[listId]
 * Update grocery list (status change, approve). PARENT only for approval.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { listId } = params;

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

    const familyId = membership.familyId;

    // Get grocery list
    const groceryList = await prisma.groceryList.findUnique({
      where: { id: listId },
    });

    if (!groceryList || groceryList.familyId !== familyId) {
      return errorResponse("Grocery list not found or access denied", 404);
    }

    const body = await req.json();
    const { status } = await validateBody(updateGroceryListSchema, body);

    // If status is APPROVED, require PARENT
    if (status === "APPROVED") {
      await requireRole(membership.id, "PARENT");
    }

    if (status) {
      await updateGroceryListStatus(listId, status);
    }

    const updated = await prisma.groceryList.findUnique({
      where: { id: listId },
      include: {
        items: {
          orderBy: { groceryCategory: "asc" },
        },
      },
    });

    return jsonResponse({
      groceryList: updated,
      message: "Grocery list updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating grocery list:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can approve grocery lists", 403);
    }
    return errorResponse(error.message || "Failed to update grocery list", 400);
  }
}
