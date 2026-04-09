import { NextRequest } from "next/server";
import {
  getCurrentUser,
  jsonResponse,
  errorResponse,
  validateBody,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createFoodSchema = z.object({
  name: z.string().min(1, "Food name is required"),
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
  ]),
  mealType: z.enum(["DINNER", "BREAKFAST_PREP"]).optional(),
  recipeUrl: z.string().url().optional(),
  servings: z.number().int().min(1).optional(),
  prepTimeMinutes: z.number().int().min(0).optional(),
  cookTimeMinutes: z.number().int().min(0).optional(),
  dietaryTags: z.array(z.string()).optional(),
  batchYield: z.number().int().optional(),
  batchUnit: z.string().optional(),
  storageMethod: z.enum(["FRIDGE", "FREEZER", "COUNTER"]).optional(),
  shelfLifeDays: z.number().int().optional(),
});

/**
 * POST /api/foods
 * Add food option. If user is PARENT, status=ACTIVE. If MEMBER, status=PENDING_APPROVAL.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const foodData = await validateBody(createFoodSchema, body);

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

    // Determine status based on role
    const status = membership.role === "PARENT" ? "ACTIVE" : "PENDING_APPROVAL";

    const food = await prisma.foodOption.create({
      data: {
        familyId,
        createdById: user.id,
        name: foodData.name,
        category: foodData.category,
        mealType: foodData.mealType || "DINNER",
        recipeUrl: foodData.recipeUrl,
        servings: foodData.servings || 4,
        prepTimeMinutes: foodData.prepTimeMinutes || 0,
        cookTimeMinutes: foodData.cookTimeMinutes || 0,
        dietaryTags: foodData.dietaryTags || [],
        batchYield: foodData.batchYield,
        batchUnit: foodData.batchUnit,
        storageMethod: foodData.storageMethod,
        shelfLifeDays: foodData.shelfLifeDays,
        status,
      },
    });

    return jsonResponse({
      food,
      message: `Food option created with status: ${status}`,
    }, 201);
  } catch (error: any) {
    console.error("Error creating food:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to create food option", 400);
  }
}

/**
 * GET /api/foods
 * List food options for current family. Query params: category, mealType, status, search.
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

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const mealType = searchParams.get("mealType");
    const search = searchParams.get("search");
    const statusParam = searchParams.get("status") || "ACTIVE";

    // Build where clause
    const where: any = { familyId };

    if (statusParam) {
      where.status = statusParam;
    }

    if (category) {
      where.category = category;
    }

    if (mealType) {
      where.mealType = mealType;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const foods = await prisma.foodOption.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonResponse({
      foods,
      count: foods.length,
    });
  } catch (error: any) {
    console.error("Error fetching foods:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch foods", 400);
  }
}
