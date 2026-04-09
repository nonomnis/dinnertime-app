import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
  validateBody,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateGroceryItemSchema = z.object({
  isChecked: z.boolean().optional(),
  quantity: z.number().min(0).optional(),
});

/**
 * PATCH /api/grocery/[listId]/items/[itemId]
 * Toggle check on grocery item, update quantity.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { listId: string; itemId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const { listId, itemId } = params;

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

    // Get grocery item
    const item = await prisma.groceryItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.groceryListId !== listId) {
      return errorResponse("Grocery item not found", 404);
    }

    const body = await req.json();
    const { isChecked, quantity } = await validateBody(updateGroceryItemSchema, body);

    // Update item
    const updates: any = {};

    if (isChecked !== undefined) {
      updates.isChecked = isChecked;
      if (isChecked) {
        updates.checkedById = user.id;
      } else {
        updates.checkedById = null;
      }
    }

    if (quantity !== undefined) {
      updates.quantity = quantity;
    }

    const updated = await prisma.groceryItem.update({
      where: { id: itemId },
      data: updates,
    });

    return jsonResponse({
      item: updated,
      message: "Grocery item updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating grocery item:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to update grocery item", 400);
  }
}
