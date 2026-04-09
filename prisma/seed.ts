import { PrismaClient, MealType, MealCategory, FoodStatus, GroceryAisle, StorageMethod } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// Seed Data Types
// ============================================================================

interface IngredientData {
  name: string;
  quantity: number;
  unit: string;
  groceryCategory: GroceryAisle;
  isOptional?: boolean;
}

interface FoodData {
  name: string;
  category: MealCategory;
  mealType: MealType;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  batchYield?: number;
  batchUnit?: string;
  storageMethod?: StorageMethod;
  shelfLifeDays?: number;
  ingredients: IngredientData[];
}

// ============================================================================
// Meal Data - 32 total meals
// ============================================================================

const BEEF_MEALS: FoodData[] = [
  {
    name: 'Tacos',
    category: MealCategory.BEEF,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    ingredients: [
      { name: 'Ground Beef', quantity: 2, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Taco Shells', quantity: 18, unit: 'count', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Lettuce', quantity: 1, unit: 'head', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Tomato', quantity: 3, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Cheddar Cheese', quantity: 8, unit: 'oz', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Sour Cream', quantity: 16, unit: 'oz', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Taco Seasoning', quantity: 1, unit: 'packet', groceryCategory: GroceryAisle.SPICES },
    ],
  },
  {
    name: 'Spaghetti',
    category: MealCategory.PASTA,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    ingredients: [
      { name: 'Ground Beef', quantity: 2, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Spaghetti Noodles', quantity: 1, unit: 'lb', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Marinara Sauce', quantity: 24, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Garlic', quantity: 4, unit: 'cloves', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Onion', quantity: 1, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Parmesan Cheese', quantity: 4, unit: 'oz', groceryCategory: GroceryAisle.DAIRY },
    ],
  },
  {
    name: 'Hamburger Soup',
    category: MealCategory.BEEF,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    ingredients: [
      { name: 'Ground Beef', quantity: 1.5, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Potatoes', quantity: 4, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Carrots', quantity: 3, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Celery', quantity: 3, unit: 'stalks', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Diced Tomatoes', quantity: 14.5, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Beef Broth', quantity: 32, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Onion', quantity: 1, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
    ],
  },
  {
    name: "Shepherd's Pie",
    category: MealCategory.BEEF,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 20,
    cookTimeMinutes: 30,
    ingredients: [
      { name: 'Ground Beef', quantity: 2, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Mashed Potatoes', quantity: 5, unit: 'lbs', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Corn', quantity: 15, unit: 'oz', groceryCategory: GroceryAisle.FROZEN },
      { name: 'Peas', quantity: 15, unit: 'oz', groceryCategory: GroceryAisle.FROZEN },
      { name: 'Beef Gravy', quantity: 12, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Onion', quantity: 1, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Garlic', quantity: 2, unit: 'cloves', groceryCategory: GroceryAisle.PRODUCE },
    ],
  },
  {
    name: 'Korean Beef',
    category: MealCategory.INTERNATIONAL,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    ingredients: [
      { name: 'Ground Beef', quantity: 2, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Brown Sugar', quantity: 0.25, unit: 'cup', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Soy Sauce', quantity: 0.5, unit: 'cup', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Sesame Oil', quantity: 2, unit: 'tbsp', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Garlic', quantity: 6, unit: 'cloves', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Ginger', quantity: 1, unit: 'tbsp', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Green Onions', quantity: 1, unit: 'bunch', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Rice', quantity: 3, unit: 'cups', groceryCategory: GroceryAisle.PANTRY },
    ],
  },
  {
    name: 'Beef Stew',
    category: MealCategory.SLOW_COOKER,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 20,
    cookTimeMinutes: 180,
    ingredients: [
      { name: 'Beef Stew Meat', quantity: 3, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Potatoes', quantity: 4, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Carrots', quantity: 4, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Celery', quantity: 3, unit: 'stalks', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Onion', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Beef Broth', quantity: 48, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Tomato Paste', quantity: 3, unit: 'tbsp', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Flour', quantity: 3, unit: 'tbsp', groceryCategory: GroceryAisle.PANTRY },
    ],
  },
  {
    name: 'Beef Stir Fry / Fajitas',
    category: MealCategory.FREESTYLE,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    ingredients: [
      { name: 'Flank Steak', quantity: 2, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Bell Peppers', quantity: 3, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Onion', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Soy Sauce', quantity: 0.25, unit: 'cup', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Garlic', quantity: 4, unit: 'cloves', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Tortillas', quantity: 14, unit: 'count', groceryCategory: GroceryAisle.BAKERY },
      { name: 'Rice', quantity: 2, unit: 'cups', groceryCategory: GroceryAisle.PANTRY },
    ],
  },
  {
    name: 'Slow Cooker Beef Roast',
    category: MealCategory.SLOW_COOKER,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 240,
    ingredients: [
      { name: 'Chuck Roast', quantity: 4, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Potatoes', quantity: 5, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Carrots', quantity: 4, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Onion', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Beef Broth', quantity: 32, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Garlic', quantity: 4, unit: 'cloves', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Rosemary', quantity: 1, unit: 'tbsp', groceryCategory: GroceryAisle.SPICES },
    ],
  },
  {
    name: 'Roast (Beef)',
    category: MealCategory.GRILL,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 60,
    ingredients: [
      { name: 'Beef Roast', quantity: 4, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Potatoes', quantity: 5, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Carrots', quantity: 4, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Onion', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Garlic', quantity: 4, unit: 'cloves', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Olive Oil', quantity: 3, unit: 'tbsp', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Thyme', quantity: 1, unit: 'tbsp', groceryCategory: GroceryAisle.SPICES },
    ],
  },
];

const CHICKEN_MEALS: FoodData[] = [
  {
    name: 'Chicken Broccoli Rice',
    category: MealCategory.CHICKEN,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    ingredients: [
      { name: 'Chicken Breast', quantity: 3, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Broccoli', quantity: 2, unit: 'heads', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Rice', quantity: 3, unit: 'cups', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Cream of Chicken Soup', quantity: 20, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Cheddar Cheese', quantity: 8, unit: 'oz', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Onion', quantity: 1, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
    ],
  },
  {
    name: 'Chicken Noodle Soup',
    category: MealCategory.CHICKEN,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    ingredients: [
      { name: 'Chicken Breast', quantity: 2.5, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Egg Noodles', quantity: 12, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Carrots', quantity: 3, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Celery', quantity: 3, unit: 'stalks', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Onion', quantity: 1, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Chicken Broth', quantity: 48, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Garlic', quantity: 2, unit: 'cloves', groceryCategory: GroceryAisle.PRODUCE },
    ],
  },
  {
    name: 'Italian Chicken',
    category: MealCategory.CHICKEN,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    ingredients: [
      { name: 'Chicken Breast', quantity: 3, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Italian Dressing', quantity: 16, unit: 'oz', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Mozzarella Cheese', quantity: 8, unit: 'oz', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Sun-Dried Tomatoes', quantity: 4, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Spinach', quantity: 8, unit: 'oz', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Garlic', quantity: 3, unit: 'cloves', groceryCategory: GroceryAisle.PRODUCE },
    ],
  },
  {
    name: 'Chicken Alfredo',
    category: MealCategory.PASTA,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    ingredients: [
      { name: 'Chicken Breast', quantity: 3, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Fettuccine Noodles', quantity: 1, unit: 'lb', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Alfredo Sauce', quantity: 24, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Garlic', quantity: 3, unit: 'cloves', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Parmesan Cheese', quantity: 4, unit: 'oz', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Butter', quantity: 2, unit: 'tbsp', groceryCategory: GroceryAisle.DAIRY },
    ],
  },
  {
    name: 'Crispy Chicken & Roasted Potatoes',
    category: MealCategory.GRILL,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 45,
    ingredients: [
      { name: 'Chicken Thighs', quantity: 4, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Potatoes', quantity: 5, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Olive Oil', quantity: 4, unit: 'tbsp', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Garlic Powder', quantity: 2, unit: 'tsp', groceryCategory: GroceryAisle.SPICES },
      { name: 'Paprika', quantity: 1, unit: 'tbsp', groceryCategory: GroceryAisle.SPICES },
      { name: 'Italian Seasoning', quantity: 1, unit: 'tbsp', groceryCategory: GroceryAisle.SPICES },
    ],
  },
  {
    name: 'Asian Chicken',
    category: MealCategory.INTERNATIONAL,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    ingredients: [
      { name: 'Chicken Breast', quantity: 3, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Soy Sauce', quantity: 0.25, unit: 'cup', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Honey', quantity: 0.25, unit: 'cup', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Garlic', quantity: 5, unit: 'cloves', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Ginger', quantity: 1, unit: 'tbsp', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Sesame Oil', quantity: 2, unit: 'tbsp', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Broccoli', quantity: 2, unit: 'heads', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Rice', quantity: 3, unit: 'cups', groceryCategory: GroceryAisle.PANTRY },
    ],
  },
  {
    name: 'Apricot Chicken',
    category: MealCategory.CHICKEN,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    ingredients: [
      { name: 'Chicken Breast', quantity: 3, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Apricot Preserves', quantity: 12, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Onion Soup Mix', quantity: 1, unit: 'packet', groceryCategory: GroceryAisle.SPICES },
      { name: 'Soy Sauce', quantity: 2, unit: 'tbsp', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Rice', quantity: 3, unit: 'cups', groceryCategory: GroceryAisle.PANTRY },
    ],
  },
  {
    name: 'Chicken Pot Pie',
    category: MealCategory.CHICKEN,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 40,
    ingredients: [
      { name: 'Chicken Breast', quantity: 3, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Pie Crust', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.FROZEN },
      { name: 'Peas', quantity: 15, unit: 'oz', groceryCategory: GroceryAisle.FROZEN },
      { name: 'Carrots', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Celery', quantity: 2, unit: 'stalks', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Cream of Chicken Soup', quantity: 20, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Onion', quantity: 1, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
    ],
  },
  {
    name: 'BBQ Chicken Sandwiches',
    category: MealCategory.CHICKEN,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    ingredients: [
      { name: 'Chicken Breast', quantity: 3, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'BBQ Sauce', quantity: 18, unit: 'oz', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Hamburger Buns', quantity: 14, unit: 'count', groceryCategory: GroceryAisle.BAKERY },
      { name: 'Coleslaw Mix', quantity: 16, unit: 'oz', groceryCategory: GroceryAisle.PRODUCE },
    ],
  },
  {
    name: 'Fried Rice',
    category: MealCategory.INTERNATIONAL,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    ingredients: [
      { name: 'Chicken Breast', quantity: 2, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Rice', quantity: 4, unit: 'cups', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Eggs', quantity: 4, unit: 'count', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Soy Sauce', quantity: 0.25, unit: 'cup', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Peas', quantity: 15, unit: 'oz', groceryCategory: GroceryAisle.FROZEN },
      { name: 'Carrots', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Sesame Oil', quantity: 2, unit: 'tbsp', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Green Onions', quantity: 1, unit: 'bunch', groceryCategory: GroceryAisle.PRODUCE },
    ],
  },
];

const PORK_MEALS: FoodData[] = [
  {
    name: 'Pork Chops',
    category: MealCategory.GRILL,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    ingredients: [
      { name: 'Pork Chops', quantity: 7, unit: 'count', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Olive Oil', quantity: 3, unit: 'tbsp', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Garlic', quantity: 4, unit: 'cloves', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Rosemary', quantity: 1, unit: 'tbsp', groceryCategory: GroceryAisle.SPICES },
      { name: 'Butter', quantity: 2, unit: 'tbsp', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Salt', quantity: 1, unit: 'tsp', groceryCategory: GroceryAisle.SPICES },
      { name: 'Black Pepper', quantity: 1, unit: 'tsp', groceryCategory: GroceryAisle.SPICES },
    ],
  },
  {
    name: 'Pork Burritos',
    category: MealCategory.FREESTYLE,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 180,
    ingredients: [
      { name: 'Pork Shoulder', quantity: 4, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Tortillas', quantity: 14, unit: 'count', groceryCategory: GroceryAisle.BAKERY },
      { name: 'Salsa', quantity: 16, unit: 'oz', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Cheddar Cheese', quantity: 8, unit: 'oz', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Sour Cream', quantity: 16, unit: 'oz', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Lettuce', quantity: 1, unit: 'head', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Beans', quantity: 30, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Rice', quantity: 3, unit: 'cups', groceryCategory: GroceryAisle.PANTRY },
    ],
  },
  {
    name: 'Pork Sandwiches',
    category: MealCategory.FREESTYLE,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 10,
    cookTimeMinutes: 180,
    ingredients: [
      { name: 'Pork Shoulder', quantity: 4, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'BBQ Sauce', quantity: 18, unit: 'oz', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Hamburger Buns', quantity: 14, unit: 'count', groceryCategory: GroceryAisle.BAKERY },
      { name: 'Coleslaw Mix', quantity: 16, unit: 'oz', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Pickles', quantity: 12, unit: 'oz', groceryCategory: GroceryAisle.CONDIMENTS },
    ],
  },
];

const SEAFOOD_MEALS: FoodData[] = [
  {
    name: 'Shrimp Stir Fry',
    category: MealCategory.INTERNATIONAL,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    ingredients: [
      { name: 'Shrimp', quantity: 2.5, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Bell Peppers', quantity: 3, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Broccoli', quantity: 2, unit: 'heads', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Snap Peas', quantity: 12, unit: 'oz', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Soy Sauce', quantity: 0.25, unit: 'cup', groceryCategory: GroceryAisle.CONDIMENTS },
      { name: 'Garlic', quantity: 5, unit: 'cloves', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Ginger', quantity: 1, unit: 'tbsp', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Rice', quantity: 3, unit: 'cups', groceryCategory: GroceryAisle.PANTRY },
    ],
  },
  {
    name: 'Fish Tacos',
    category: MealCategory.SEAFOOD,
    mealType: MealType.DINNER,
    servings: 7,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    ingredients: [
      { name: 'White Fish (Tilapia/Cod)', quantity: 2.5, unit: 'lbs', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Tortillas', quantity: 14, unit: 'count', groceryCategory: GroceryAisle.BAKERY },
      { name: 'Cabbage Slaw', quantity: 16, unit: 'oz', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Lime', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Cilantro', quantity: 1, unit: 'bunch', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Sour Cream', quantity: 16, unit: 'oz', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Avocado', quantity: 3, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
    ],
  },
];

const BREAKFAST_MEALS: FoodData[] = [
  {
    name: 'Muffins',
    category: MealCategory.BREAKFAST_PREP,
    mealType: MealType.BREAKFAST_PREP,
    servings: 12,
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    batchYield: 12,
    batchUnit: 'muffins',
    storageMethod: StorageMethod.FREEZER,
    shelfLifeDays: 30,
    ingredients: [
      { name: 'Flour', quantity: 2, unit: 'cups', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Sugar', quantity: 0.75, unit: 'cup', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Eggs', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Milk', quantity: 0.5, unit: 'cup', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Butter', quantity: 0.33, unit: 'cup', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Baking Powder', quantity: 2, unit: 'tsp', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Vanilla Extract', quantity: 1, unit: 'tsp', groceryCategory: GroceryAisle.PANTRY },
    ],
  },
  {
    name: 'Breakfast Sandwiches',
    category: MealCategory.BREAKFAST_PREP,
    mealType: MealType.BREAKFAST_PREP,
    servings: 8,
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    batchYield: 8,
    batchUnit: 'sandwiches',
    storageMethod: StorageMethod.FREEZER,
    shelfLifeDays: 30,
    ingredients: [
      { name: 'English Muffins', quantity: 8, unit: 'count', groceryCategory: GroceryAisle.BAKERY },
      { name: 'Eggs', quantity: 8, unit: 'count', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Cheddar Cheese', quantity: 8, unit: 'oz', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Sausage Patties', quantity: 16, unit: 'count', groceryCategory: GroceryAisle.FROZEN },
    ],
  },
  {
    name: 'Breakfast Burritos',
    category: MealCategory.BREAKFAST_PREP,
    mealType: MealType.BREAKFAST_PREP,
    servings: 10,
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    batchYield: 10,
    batchUnit: 'burritos',
    storageMethod: StorageMethod.FREEZER,
    shelfLifeDays: 30,
    ingredients: [
      { name: 'Tortillas', quantity: 10, unit: 'count', groceryCategory: GroceryAisle.BAKERY },
      { name: 'Eggs', quantity: 10, unit: 'count', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Cheddar Cheese', quantity: 8, unit: 'oz', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Sausage', quantity: 1, unit: 'lb', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Bell Peppers', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Onion', quantity: 1, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
    ],
  },
  {
    name: 'Biscuits & Gravy',
    category: MealCategory.BREAKFAST_PREP,
    mealType: MealType.BREAKFAST_PREP,
    servings: 8,
    prepTimeMinutes: 20,
    cookTimeMinutes: 20,
    batchYield: 8,
    batchUnit: 'servings',
    storageMethod: StorageMethod.FRIDGE,
    shelfLifeDays: 3,
    ingredients: [
      { name: 'Flour', quantity: 2.5, unit: 'cups', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Butter', quantity: 0.5, unit: 'cup', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Buttermilk', quantity: 1, unit: 'cup', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Sausage', quantity: 1, unit: 'lb', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Milk', quantity: 1, unit: 'cup', groceryCategory: GroceryAisle.DAIRY },
    ],
  },
  {
    name: 'Pancakes / Waffles',
    category: MealCategory.BREAKFAST_PREP,
    mealType: MealType.BREAKFAST_PREP,
    servings: 16,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    batchYield: 16,
    batchUnit: 'pancakes',
    storageMethod: StorageMethod.FREEZER,
    shelfLifeDays: 30,
    ingredients: [
      { name: 'Pancake Mix', quantity: 2, unit: 'cups', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Eggs', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Milk', quantity: 1.5, unit: 'cups', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Butter', quantity: 3, unit: 'tbsp', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Syrup', quantity: 16, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
    ],
  },
  {
    name: 'French Toast',
    category: MealCategory.BREAKFAST_PREP,
    mealType: MealType.BREAKFAST_PREP,
    servings: 12,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    batchYield: 12,
    batchUnit: 'slices',
    storageMethod: StorageMethod.FREEZER,
    shelfLifeDays: 30,
    ingredients: [
      { name: 'Bread', quantity: 1, unit: 'loaf', groceryCategory: GroceryAisle.BAKERY },
      { name: 'Eggs', quantity: 4, unit: 'count', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Milk', quantity: 0.5, unit: 'cup', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Cinnamon', quantity: 1, unit: 'tsp', groceryCategory: GroceryAisle.SPICES },
      { name: 'Vanilla Extract', quantity: 1, unit: 'tsp', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Butter', quantity: 3, unit: 'tbsp', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Syrup', quantity: 16, unit: 'oz', groceryCategory: GroceryAisle.PANTRY },
    ],
  },
  {
    name: 'Breakfast Skillet',
    category: MealCategory.BREAKFAST_PREP,
    mealType: MealType.BREAKFAST_PREP,
    servings: 6,
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    batchYield: 6,
    batchUnit: 'servings',
    storageMethod: StorageMethod.FRIDGE,
    shelfLifeDays: 3,
    ingredients: [
      { name: 'Potatoes', quantity: 3, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Eggs', quantity: 8, unit: 'count', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Sausage', quantity: 1, unit: 'lb', groceryCategory: GroceryAisle.PROTEIN },
      { name: 'Bell Peppers', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Onion', quantity: 1, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Cheddar Cheese', quantity: 4, unit: 'oz', groceryCategory: GroceryAisle.DAIRY },
    ],
  },
  {
    name: 'Banana Bread',
    category: MealCategory.BREAKFAST_PREP,
    mealType: MealType.BREAKFAST_PREP,
    servings: 8,
    prepTimeMinutes: 10,
    cookTimeMinutes: 55,
    batchYield: 1,
    batchUnit: 'loaf',
    storageMethod: StorageMethod.FREEZER,
    shelfLifeDays: 30,
    ingredients: [
      { name: 'Bananas', quantity: 3, unit: 'count', groceryCategory: GroceryAisle.PRODUCE },
      { name: 'Flour', quantity: 2, unit: 'cups', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Sugar', quantity: 0.75, unit: 'cup', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Eggs', quantity: 2, unit: 'count', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Butter', quantity: 0.33, unit: 'cup', groceryCategory: GroceryAisle.DAIRY },
      { name: 'Baking Soda', quantity: 1, unit: 'tsp', groceryCategory: GroceryAisle.PANTRY },
      { name: 'Vanilla Extract', quantity: 1, unit: 'tsp', groceryCategory: GroceryAisle.PANTRY },
    ],
  },
];

// ============================================================================
// Combine All Meal Data
// ============================================================================

const ALL_MEALS: FoodData[] = [
  ...BEEF_MEALS,
  ...CHICKEN_MEALS,
  ...PORK_MEALS,
  ...SEAFOOD_MEALS,
  ...BREAKFAST_MEALS,
];

// ============================================================================
// Main Seed Function
// ============================================================================

async function main() {
  try {
    console.log('Starting database seed for DinnerTime app...');

    // Check if seed data already exists
    const existingCount = await prisma.foodOption.count({
      where: {
        family: {
          name: '__SEED_TEMPLATE__',
        },
      },
    });

    if (existingCount > 0) {
      console.log(`Seed data already exists (${existingCount} food options). Skipping.`);
      return;
    }

    // Create or get the template family
    const templateFamily = await prisma.family.upsert({
      where: { name: '__SEED_TEMPLATE__' },
      update: {},
      create: {
        name: '__SEED_TEMPLATE__',
        lockInDays: 3,
        defaultEatOutDay: 5, // Friday
        timezone: 'America/New_York',
        memberCount: 7,
        createdBy: {
          create: {
            email: 'seed@dinnertime.local',
            name: 'Seed System',
          },
        },
      },
    });

    console.log(`Using template family: ${templateFamily.id}`);

    // Get or create the system user
    let systemUser = await prisma.user.findUnique({
      where: { email: 'seed@dinnertime.local' },
    });

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'seed@dinnertime.local',
          name: 'Seed System',
        },
      });
    }

    // Seed all food options with their ingredients
    let createdCount = 0;
    let ingredientCount = 0;

    for (const mealData of ALL_MEALS) {
      const foodOption = await prisma.foodOption.create({
        data: {
          name: mealData.name,
          category: mealData.category,
          mealType: mealData.mealType,
          servings: mealData.servings,
          prepTimeMinutes: mealData.prepTimeMinutes,
          cookTimeMinutes: mealData.cookTimeMinutes,
          batchYield: mealData.batchYield,
          batchUnit: mealData.batchUnit,
          storageMethod: mealData.storageMethod,
          shelfLifeDays: mealData.shelfLifeDays,
          status: FoodStatus.ACTIVE,
          familyId: templateFamily.id,
          createdById: systemUser.id,
          ingredients: {
            create: mealData.ingredients.map((ingredient) => ({
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              groceryCategory: ingredient.groceryCategory,
              isOptional: ingredient.isOptional || false,
            })),
          },
        },
        include: {
          ingredients: true,
        },
      });

      createdCount++;
      ingredientCount += foodOption.ingredients.length;

      console.log(`✓ Created: ${foodOption.name} (${foodOption.ingredients.length} ingredients)`);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`SEED COMPLETE`);
    console.log('='.repeat(60));
    console.log(`Seeded ${createdCount} food options with ${ingredientCount} total ingredients`);
    console.log(`Template family ID: ${templateFamily.id}`);
    console.log(`All foods attached to family: __SEED_TEMPLATE__`);
    console.log(''.repeat(60) + '\n');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
