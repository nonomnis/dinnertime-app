import { prisma } from './prisma';
import { getISOWeek, getWeekDates, calculateDecayedModifier } from './utils';
import {
  ScheduleType,
  ScheduleEntry,
  FoodOption,
  MealWeightModifier,
  LockedBy,
} from '@prisma/client';

// Constants for scheduling logic
const ROTATION_MIN_DAYS_APART = 14; // Min days between same meal servings
const CATEGORY_DIVERSITY_BONUS = 2.0;
const SAME_CATEGORY_PENALTY = 3.0;
const VOTE_POINTS_WEIGHT = 3.0;
const RATING_WEIGHT = 1.5;
const DAYS_SINCE_SERVED_WEIGHT = 0.5;
const VOTE_DOWN_INITIAL_PENALTY = -0.5; // -50% modifier
const ENCORE_INITIAL_BONUS = 0.3; // +30% modifier
const FAMILY_THUMBS_DOWN_THRESHOLD = 0.5; // 50% need to vote down to flag

interface ScoringContext {
  dayOfWeek: number;
  daysInSchedule: number;
  lastServedByFood: Map<string, number | null>;
  categoriesUsedThisWeek: Set<string>;
  familyMembers: number;
}

interface ScoredFood {
  foodOptionId: string;
  foodOption: FoodOption;
  score: number;
}

/**
 * Generate a dinner schedule for one week
 * 1. Assign one eat-out night (random day or family's pinned day)
 * 2. For the remaining 6 nights, score and assign highest-scoring meals
 */
export async function generateWeekSchedule(
  familyId: string,
  weekStartDate: Date
): Promise<ScheduleEntry[]> {
  const isoWeek = getISOWeek(weekStartDate);
  const weekDates = getWeekDates(isoWeek);

  // Check if schedule already exists for this week
  const existingEntries = await prisma.scheduleEntry.findMany({
    where: {
      familyId,
      week: isoWeek,
    },
  });

  if (existingEntries.length > 0) {
    return existingEntries;
  }

  // Get family settings
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: { where: { isActive: true } },
    },
  });

  if (!family) {
    throw new Error(`Family ${familyId} not found`);
  }

  const familyMemberCount = family.members.length || 1;

  // Determine eat-out day: use family's pinned day or pick random
  const eatOutDayOfWeek =
    family.defaultEatOutDay !== null && family.defaultEatOutDay !== undefined
      ? family.defaultEatOutDay
      : Math.floor(Math.random() * 7);

  // Get all active food options
  const activeFoods = await prisma.foodOption.findMany({
    where: {
      familyId,
      status: 'ACTIVE',
    },
  });

  if (activeFoods.length === 0) {
    throw new Error('No active food options available');
  }

  const entries: ScheduleEntry[] = [];
  const categoriesUsedThisWeek = new Set<string>();
  const lastServedByFood = new Map<string, number | null>();

  // Build lastServedByFood map from DB
  for (const food of activeFoods) {
    lastServedByFood.set(food.id, food.lastServedAt?.getTime() ?? null);
  }

  // Create schedule entries for the week
  for (let i = 0; i < 7; i++) {
    const date = weekDates[i];
    const dayOfWeek = (date.getDay() || 7) - 1; // 0=Mon, 6=Sun

    let entry: ScheduleEntry;

    if (dayOfWeek === eatOutDayOfWeek) {
      // Eat out night
      entry = await prisma.scheduleEntry.create({
        data: {
          familyId,
          date,
          dayOfWeek,
          type: ScheduleType.EAT_OUT,
          week: isoWeek,
          headcount: familyMemberCount,
        },
      });
    } else {
      // Score foods and pick the best one
      const context: ScoringContext = {
        dayOfWeek,
        daysInSchedule: i,
        lastServedByFood,
        categoriesUsedThisWeek,
        familyMembers: familyMemberCount,
      };

      const scoredFoods = await Promise.all(
        activeFoods.map(async (food) => ({
          foodOptionId: food.id,
          foodOption: food,
          score: await scoreFoodOption(food, context, familyId),
        }))
      );

      // Filter out foods with score 0 or below (familyThumbsDown or in cooldown)
      const viableFoods = scoredFoods.filter((sf) => sf.score > 0);

      if (viableFoods.length === 0) {
        // Fallback: pick random active food
        const fallback = activeFoods[Math.floor(Math.random() * activeFoods.length)];
        entry = await prisma.scheduleEntry.create({
          data: {
            familyId,
            date,
            dayOfWeek,
            type: ScheduleType.HOME_COOKED,
            foodOptionId: fallback.id,
            week: isoWeek,
            headcount: familyMemberCount,
          },
        });
      } else {
        // Pick the highest-scoring food
        viableFoods.sort((a, b) => b.score - a.score);
        const winner = viableFoods[0];

        entry = await prisma.scheduleEntry.create({
          data: {
            familyId,
            date,
            dayOfWeek,
            type: ScheduleType.HOME_COOKED,
            foodOptionId: winner.foodOptionId,
            week: isoWeek,
            headcount: familyMemberCount,
          },
        });

        // Update tracking for this week
        categoriesUsedThisWeek.add(winner.foodOption.category);
        lastServedByFood.set(winner.foodOptionId, date.getTime());
      }
    }

    entries.push(entry);
  }

  return entries;
}

/**
 * Generate a 52-week schedule for a family
 */
export async function generateYearSchedule(
  familyId: string,
  startDate: Date = new Date()
): Promise<ScheduleEntry[]> {
  const allEntries: ScheduleEntry[] = [];

  for (let week = 0; week < 52; week++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + week * 7);

    try {
      const weekEntries = await generateWeekSchedule(familyId, weekStart);
      allEntries.push(...weekEntries);
    } catch (error) {
      console.error(`Failed to generate schedule for week ${week}:`, error);
    }
  }

  return allEntries;
}

/**
 * Regenerate schedule for all future unlocked weeks from a given date
 */
export async function rerollUnlockedWeeks(
  familyId: string,
  fromDate: Date
): Promise<ScheduleEntry[]> {
  const isoWeek = getISOWeek(fromDate);

  // Find all unlocked entries from this week onwards
  const unlockedEntries = await prisma.scheduleEntry.findMany({
    where: {
      familyId,
      week: { gte: isoWeek },
      isLocked: false,
    },
  });

  // Delete these entries to allow regeneration
  await prisma.scheduleEntry.deleteMany({
    where: {
      id: { in: unlockedEntries.map((e) => e.id) },
    },
  });

  // Regenerate the year from this date
  return generateYearSchedule(familyId, fromDate);
}

/**
 * Lock all schedule entries that fall within the lock-in window
 */
export async function lockDueEntries(familyId: string): Promise<number> {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
  });

  if (!family) {
    throw new Error(`Family ${familyId} not found`);
  }

  const now = new Date();
  const lockInWindowEnd = new Date(now);
  lockInWindowEnd.setDate(lockInWindowEnd.getDate() + family.lockInDays);

  const result = await prisma.scheduleEntry.updateMany({
    where: {
      familyId,
      date: { lte: lockInWindowEnd },
      isLocked: false,
    },
    data: {
      isLocked: true,
      lockedAt: now,
      lockedBy: LockedBy.SYSTEM,
    },
  });

  return result.count;
}

/**
 * Get the net modifier value for a food option
 * Sums all active modifiers with decay applied
 */
export async function getActiveModifiers(foodOptionId: string): Promise<number> {
  const modifiers = await prisma.mealWeightModifier.findMany({
    where: {
      foodOptionId,
      expiresAt: { gt: new Date() },
      clearedAt: null,
    },
  });

  let totalModifier = 0;

  for (const modifier of modifiers) {
    const decayedValue = calculateDecayedModifier(
      modifier.initialPenalty,
      modifier.decayIntervalWeeks,
      modifier.createdAt
    );

    totalModifier += decayedValue;
  }

  return totalModifier;
}

/**
 * Score a single food option given context
 * Returns a score >= 0; score of 0 means excluded
 */
export async function scoreFoodOption(
  food: FoodOption,
  context: ScoringContext,
  familyId: string
): Promise<number> {
  // Check if familyThumbsDown (50%+ voted down)
  const thumbsDownCount = await prisma.mealFeedback.count({
    where: {
      familyId,
      foodOptionId: food.id,
      action: 'VOTE_DOWN',
    },
  });

  const totalFeedback = await prisma.mealFeedback.count({
    where: {
      familyId,
      foodOptionId: food.id,
    },
  });

  if (totalFeedback > 0 && thumbsDownCount / totalFeedback >= FAMILY_THUMBS_DOWN_THRESHOLD) {
    return 0; // Excluded
  }

  // Calculate base score
  const votePoints = await getVotePointsForFood(food.id, familyId);
  const daysSinceLastServed = food.lastServedAt
    ? (new Date().getTime() - food.lastServedAt.getTime()) / (1000 * 60 * 60 * 24)
    : 365; // Default to 1 year if never served

  let baseScore =
    votePoints * VOTE_POINTS_WEIGHT +
    food.averageRating * RATING_WEIGHT +
    Math.min(daysSinceLastServed, 365) * DAYS_SINCE_SERVED_WEIGHT;

  // Category diversity bonus
  if (!context.categoriesUsedThisWeek.has(food.category)) {
    baseScore += CATEGORY_DIVERSITY_BONUS;
  } else {
    baseScore -= SAME_CATEGORY_PENALTY;
  }

  // Check rotation constraints (not served in last 14 days)
  if (food.lastServedAt) {
    const daysSinceServed =
      (new Date().getTime() - food.lastServedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceServed < ROTATION_MIN_DAYS_APART) {
      return 0; // Excluded
    }
  }

  // Apply feedback modifiers (with decay)
  const feedbackModifier = await getActiveModifiers(food.id);
  const finalScore = baseScore * (1 + feedbackModifier);

  return Math.max(0, finalScore);
}

/**
 * Calculate total vote points for a food option
 * Simpler version: count positive votes, count negative votes with weight
 */
async function getVotePointsForFood(foodOptionId: string, familyId: string): Promise<number> {
  const votes = await prisma.vote.count({
    where: {
      foodOptionId,
      familyId,
    },
  });

  // Simple linear scoring: each vote = 1 point
  return Math.max(0, votes);
}
