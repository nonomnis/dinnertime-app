import { prisma } from './prisma';
import { getWeekDates, getISOWeek } from './utils';
import { GroceryListStatus, GroceryAisle } from '@prisma/client';

interface AggregatedIngredient {
  ingredientName: string;
  unit: string;
  quantity: number;
  groceryCategory: GroceryAisle;
  sourceEntryIds: string[];
}

/**
 * Generate a grocery list from locked schedule entries for a given week
 */
export async function generateGroceryList(
  familyId: string,
  isoWeek: string
): Promise<string> {
  // Check if grocery list already exists
  let groceryList = await prisma.groceryList.findFirst({
    where: {
      familyId,
      weekOf: isoWeek,
    },
    include: {
      items: true,
    },
  });

  if (groceryList && groceryList.items.length > 0) {
    return groceryList.id;
  }

  // Get all locked schedule entries for this week
  const scheduleEntries = await prisma.scheduleEntry.findMany({
    where: {
      familyId,
      week: isoWeek,
      isLocked: true,
      type: 'HOME_COOKED',
      foodOption: {
        isNotNot: null,
      },
    },
    include: {
      foodOption: {
        include: {
          ingredients: true,
        },
      },
    },
  });

  if (!scheduleEntries.length) {
    // Create empty grocery list
    if (!groceryList) {
      groceryList = await prisma.groceryList.create({
        data: {
          familyId,
          weekOf: isoWeek,
          status: GroceryListStatus.DRAFT,
        },
        include: {
          items: true,
        },
      });
    }
    return groceryList.id;
  }

  // Aggregate ingredients
  const ingredientMap = new Map<string, AggregatedIngredient>();

  for (const entry of scheduleEntries) {
    if (!entry.foodOption?.ingredients) continue;

    for (const ingredient of entry.foodOption.ingredients) {
      const key = `${ingredient.name}|${ingredient.unit}`;
      const scaled = scaleIngredient(
        ingredient,
        entry.headcount,
        entry.foodOption.servings
      );

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!;
        existing.quantity += scaled.quantity;
        existing.sourceEntryIds.push(entry.id);
      } else {
        ingredientMap.set(key, {
          ingredientName: ingredient.name,
          unit: ingredient.unit,
          quantity: scaled.quantity,
          groceryCategory: ingredient.groceryCategory,
          sourceEntryIds: [entry.id],
        });
      }
    }
  }

  // Create or update grocery list
  if (!groceryList) {
    groceryList = await prisma.groceryList.create({
      data: {
        familyId,
        weekOf: isoWeek,
        status: GroceryListStatus.DRAFT,
      },
      include: {
        items: true,
      },
    });
  }

  // Add items to grocery list
  const groceryItems = Array.from(ingredientMap.values()).map((agg) => ({
    groceryListId: groceryList.id,
    ingredientName: agg.ingredientName,
    quantity: roundToPackageSize(agg.quantity, agg.unit),
    unit: agg.unit,
    groceryCategory: agg.groceryCategory,
    sourceEntryIds: agg.sourceEntryIds,
    isChecked: false,
    isPantryItem: false,
    isRecurringStaple: false,
  }));

  // Create items in database
  for (const item of groceryItems) {
    await prisma.groceryItem.create({ data: item });
  }

  return groceryList.id;
}

/**
 * Scale an ingredient based on actual headcount vs. recipe servings
 */
export function scaleIngredient(
  ingredient: {
    quantity: number;
    unit: string;
  },
  actualHeadcount: number,
  recipeServings: number
): { quantity: number; unit: string } {
  const scaleFactor = actualHeadcount / recipeServings;
  return {
    quantity: ingredient.quantity * scaleFactor,
    unit: ingredient.unit,
  };
}

/**
 * Aggregate ingredients by name and unit, summing quantities
 */
export function aggregateIngredients(
  ingredients: Array<{
    ingredientName: string;
    unit: string;
    quantity: number;
    groceryCategory: GroceryAisle;
  }>
): AggregatedIngredient[] {
  const map = new Map<string, AggregatedIngredient>();

  for (const ing of ingredients) {
    const key = `${ing.ingredientName}|${ing.unit}`;
    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.quantity += ing.quantity;
    } else {
      map.set(key, {
        ingredientName: ing.ingredientName,
        unit: ing.unit,
        quantity: ing.quantity,
        groceryCategory: ing.groceryCategory,
        sourceEntryIds: [],
      });
    }
  }

  return Array.from(map.values());
}

/**
 * Round quantity to practical purchase units
 * Examples: 1.3 lbs -> 1.5 lbs, 2.7 cups -> 3 cups
 */
export function roundToPackageSize(quantity: number, unit: string): number {
  // For whole units, round to nearest 0.5
  if (['cup', 'cups', 'tbsp', 'tsp', 'oz', 'count', 'item'].includes(unit.toLowerCase())) {
    return Math.ceil(quantity * 2) / 2; // Round up to nearest 0.5
  }

  // For weight units, round to nearest practical amount
  if (['lb', 'lbs', 'kg', 'g'].includes(unit.toLowerCase())) {
    if (quantity < 1) {
      return Math.ceil(quantity * 4) / 4; // 0.25 lb increments
    }
    return Math.ceil(quantity * 2) / 2; // 0.5 lb increments
  }

  // Default: round up to nearest integer
  return Math.ceil(quantity);
}

/**
 * Get or generate grocery list for a week
 */
export async function getGroceryListForWeek(
  familyId: string,
  isoWeek: string
): Promise<string> {
  // Try to find existing
  const existing = await prisma.groceryList.findFirst({
    where: {
      familyId,
      weekOf: isoWeek,
    },
  });

  if (existing) {
    return existing.id;
  }

  // Generate new
  return generateGroceryList(familyId, isoWeek);
}

/**
 * Toggle a grocery item as checked/unchecked
 */
export async function toggleGroceryItem(
  itemId: string,
  userId: string
): Promise<void> {
  const item = await prisma.groceryItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error('Grocery item not found');
  }

  const newCheckedState = !item.isChecked;

  await prisma.groceryItem.update({
    where: { id: itemId },
    data: {
      isChecked: newCheckedState,
      checkedById: newCheckedState ? userId : null,
    },
  });
}

/**
 * Update estimated total cost for a grocery list
 */
export async function updateGroceryListTotal(
  groceryListId: string,
  estimatedTotal: number
): Promise<void> {
  await prisma.groceryList.update({
    where: { id: groceryListId },
    data: {
      estimatedTotal,
      updatedAt: new Date(),
    },
  });
}

/**
 * Mark a grocery list as approved, shopping, or completed
 */
export async function updateGroceryListStatus(
  groceryListId: string,
  status: GroceryListStatus
): Promise<void> {
  await prisma.groceryList.update({
    where: { id: groceryListId },
    data: {
      status,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get all grocery items for a list, sorted by aisle
 */
export async function getGroceryListItems(groceryListId: string) {
  const items = await prisma.groceryItem.findMany({
    where: { groceryListId },
    orderBy: { groceryCategory: 'asc' },
  });

  return items;
}

/**
 * Clear all checked items from a grocery list
 */
export async function clearCheckedItems(groceryListId: string): Promise<number> {
  const result = await prisma.groceryItem.deleteMany({
    where: {
      groceryListId,
      isChecked: true,
    },
  });

  return result.count;
}
