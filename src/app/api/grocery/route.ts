import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
  validateBody,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { generateGroceryList } from "@/lib/grocery-engine";
import { getISOWeek } from "@/lib/utils";
import { z } from "zod";

const generateGrocerySchema = z.object({
  week: z.string().regex(/^\d{4}-W\d{2}$/, "Week must be in format YYYY-W##"),
});

/**
 * GET /api/grocery
 * Get grocery list for a week. If none exists, auto-generates.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

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

    // Parse week query param
    const searchParams = req.nextUrl.searchParams;
    const weekParam = searchParams.get("week");
    const isoWeek = weekParam || getISOWeek(new Date());

    // Try to find existing grocery list
    let groceryList = await prisma.groceryList.findFirst({
      where: {
        familyId,
        weekOf: isoWeek,
      },
      include: {
        items: {
          orderBy: { groceryCategory: "asc" },
        },
      },
    });

    // If not found, generate it
    if (!groceryList) {
      const listId = await generateGroceryList(familyId, isoWeek);
      groceryList = await prisma.groceryList.findUnique({
        where: { id: listId },
        include: {
          items: {
            orderBy: { groceryCategory: "asc" },
          },
        },
      });
    }

    return jsonResponse({
      groceryList,
      itemCount: groceryList?.items.length || 0,
    });
  } catch (error: any) {
    console.error("Error fetching grocery list:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch grocery list", 400);
  }
}

/**
 * POST /api/grocery
 * Generate/regenerate grocery list for a week. Calls grocery-engine.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

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

    const body = await req.json();
    const { week } = await validateBody(generateGrocerySchema, body);

    // Delete existing grocery list for this week (if any)
    await prisma.groceryList.deleteMany({
      where: {
        familyId,
        weekOf: week,
      },
    });

    // Generate new grocery list
    const listId = await generateGroceryList(familyId, week);

    const groceryList = await prisma.groceryList.findUnique({
      where: { id: listId },
      include: {
        items: {
          orderBy: { groceryCategory: "asc" },
        },
      },
    });

    return jsonResponse({
      groceryList,
      message: "Grocery list generated successfully",
    }, 201);
  } catch (error: any) {
    console.error("Error generating grocery list:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to generate grocery list", 400);
  }
}
