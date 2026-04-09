import {
  MealCategory,
  ScheduleEntry,
  FoodOption,
  Family,
  FamilyMember,
  GroceryList,
  GroceryListItem,
} from "@prisma/client";

/**
 * Display info for meal categories
 */
export interface MealCategoryInfo {
  value: MealCategory;
  label: string;
  color: string;
  icon: string;
}

/**
 * Meal category enum values with display metadata
 */
export const MEAL_CATEGORIES: MealCategoryInfo[] = [
  {
    value: "BREAKFAST",
    label: "Breakfast",
    color: "bg-yellow-100 text-yellow-800",
    icon: "Coffee",
  },
  {
    value: "LUNCH",
    label: "Lunch",
    color: "bg-blue-100 text-blue-800",
    icon: "Utensils",
  },
  {
    value: "DINNER",
    label: "Dinner",
    color: "bg-purple-100 text-purple-800",
    icon: "Moon",
  },
  {
    value: "SNACK",
    label: "Snack",
    color: "bg-orange-100 text-orange-800",
    icon: "Apple",
  },
];

/**
 * Schedule entry with associated food option
 */
export type ScheduleWithFood = ScheduleEntry & {
  foodOption: FoodOption | null;
};

/**
 * Vote tally for a food option
 */
export interface VoteTally {
  foodOptionId: string;
  foodOption: FoodOption;
  voteCount: number;
  voters: string[];
}

/**
 * A complete week schedule with all entries and metadata
 */
export interface WeekSchedule {
  week: string; // ISO week string "2026-W16"
  dates: Date[];
  entries: ScheduleWithFood[];
  isCurrentWeek: boolean;
}

/**
 * Family statistics summary
 */
export interface FamilyStats {
  totalMembers: number;
  activeMealCount: number;
  plannedMealsThisWeek: number;
  averageVotesPerMeal: number;
}

/**
 * Grocery list with all items
 */
export type GroceryListWithItems = GroceryList & {
  items: GroceryListItem[];
};

/**
 * Extended session user with family context
 */
export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  familyId?: string;
  role?: "GUEST" | "MEMBER" | "ADMIN";
}
