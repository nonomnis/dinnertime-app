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

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  groceryCategory: z.enum([
    "PRODUCE",
    "DAIRY",
    "PROTEIN",
    "PANTRY",
    "FROZEN",
    "BAKERY",
    "BEVERAGES",
    "CONDIMENTS",
    "SPICES",
    "OTHER",
  ]),
  isOptional: z.boolean().optional(),
});

const addIngredientSchema = ingredientSchema;

const bulkIngredientsSchema = z.object({
  ingredients: z.array(ingredientSchema),
});

/**
 * GET /api/foods/[foodId]/ingredients
 * List ingredients for a food option
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

    // Verify food belongs to family
    const food = await prisma.foodOption.findUnique({
      where: { id: foodId },
    });

    if (!food || food.familyId !== membership.familyId) {
      return errorResponse("Food option not found or access denied", 404);
    }

    const ingredients = await prisma.ingredient.findMany({
      where: { foodOptionId: foodId },
      orderBy: { name: "asc" },
    });

    return jsonResponse({
      ingredients,
      count: ingredients.length,
    });
  } catch (error: any) {
    console.error("Error fetching ingredients:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse(error.message || "Failed to fetch ingredients", 400);
  }
}

/**
 * POST /api/foods/[foodId]/ingredients
 * Add ingredient. PARENT only.
 */
export async function POST(
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
    const ingredientData = await validateBody(addIngredientSchema, body);

    const ingredient = await prisma.ingredient.create({
      data: {
        foodOptionId: foodId,
        name: ingredientData.name,
        quantity: ingredientData.quantity,
        unit: ingredientData.unit,
        groceryCategory: ingredientData.groceryCategory,
        isOptional: ingredientData.isOptional || false,
      },
    });

    return jsonResponse({ ingredient, message: "Ingredient added successfully" }, 201);
  } catch (error: any) {
    console.error("Error adding ingredient:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can add ingredients", 403);
    }
    return errorResponse(error.message || "Failed to add ingredient", 400);
  }
}

/**
 * PUT /api/foods/[foodId]/ingredients
 * Replace all ingredients (bulk update). PARENT only.
 */
export async function PUT(
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
    const { ingredients: ingredientsData } = await validateBody(bulkIngredientsSchema, body);

    // Delete existing ingredients
    await prisma.ingredient.deleteMany({
      where: { foodOptionId: foodId },
    });

    // Create new ingredients
    const ingredients = await Promise.all(
      ingredientsData.map((ing) =>
        prisma.ingredient.create({
          data: {
            foodOptionId: foodId,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            groceryCategory: ing.groceryCategory,
            isOptional: ing.isOptional || false,
          },
        })
      )
    );

    return jsonResponse({
      ingredients,
      count: ingredients.length,
      message: "Ingredients updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating ingredients:", error);
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Insufficient permissions") {
      return errorResponse("Only PARENT members can update ingredients", 403);
    }
    return errorResponse(error.message || "Failed to update ingredients", 400);
  }
}
