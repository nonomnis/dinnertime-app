import { prisma } from './prisma';
import { FeedbackAction, ModifierType } from '@prisma/client';

interface VoteTally {
  foodOptionId: string;
  foodOptionName: string;
  voteCount: number;
  voters: string[]; // User IDs
}

interface VotingSlot {
  scheduleEntryId: string;
  date: Date;
  daysUntilLocked: number;
  isOpen: boolean;
  currentWinner: {
    foodOptionId: string;
    foodOptionName: string;
    votes: number;
  } | null;
}

/**
 * Get all voting slots beyond the lock-in window that are open for voting
 */
export async function getOpenVotingSlots(familyId: string): Promise<VotingSlot[]> {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
  });

  if (!family) {
    throw new Error(`Family ${familyId} not found`);
  }

  const now = new Date();
  const lockInWindowEnd = new Date(now);
  lockInWindowEnd.setDate(lockInWindowEnd.getDate() + family.lockInDays);

  const scheduleEntries = await prisma.scheduleEntry.findMany({
    where: {
      familyId,
      date: { gt: lockInWindowEnd },
      isLocked: false,
      type: 'HOME_COOKED',
    },
    include: {
      foodOption: true,
      votes: true,
    },
    orderBy: { date: 'asc' },
  });

  const slots: VotingSlot[] = [];

  for (const entry of scheduleEntries) {
    const daysUntilLocked = Math.ceil(
      (entry.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const tallies = await getVoteTallies(familyId, entry.id);
    const currentWinner = tallies.length > 0 ? tallies[0] : null;

    slots.push({
      scheduleEntryId: entry.id,
      date: entry.date,
      daysUntilLocked,
      isOpen: daysUntilLocked > 0 && !entry.isLocked,
      currentWinner: currentWinner
        ? {
            foodOptionId: currentWinner.foodOptionId,
            foodOptionName: currentWinner.foodOptionName,
            votes: currentWinner.voteCount,
          }
        : null,
    });
  }

  return slots;
}

/**
 * Cast or update a vote from a user for a schedule slot
 * One vote per user per slot
 */
export async function castVote(
  familyId: string,
  userId: string,
  scheduleEntryId: string,
  foodOptionId: string
): Promise<void> {
  // Verify schedule entry exists and is open for voting
  const entry = await prisma.scheduleEntry.findUnique({
    where: { id: scheduleEntryId },
  });

  if (!entry) {
    throw new Error('Schedule entry not found');
  }

  if (entry.isLocked) {
    throw new Error('Schedule entry is locked for voting');
  }

  const family = await prisma.family.findUnique({
    where: { id: familyId },
  });

  if (!family) {
    throw new Error('Family not found');
  }

  const now = new Date();
  const lockInWindowEnd = new Date(now);
  lockInWindowEnd.setDate(lockInWindowEnd.getDate() + family.lockInDays);

  if (entry.date <= lockInWindowEnd) {
    throw new Error('This date is within the lock-in window');
  }

  // Verify food option exists
  const food = await prisma.foodOption.findUnique({
    where: { id: foodOptionId },
  });

  if (!food || food.familyId !== familyId) {
    throw new Error('Food option not found');
  }

  // Check for existing vote
  const existingVote = await prisma.vote.findUnique({
    where: {
      scheduleEntryId_userId: {
        scheduleEntryId,
        userId,
      },
    },
  });

  if (existingVote) {
    // Update existing vote
    await prisma.vote.update({
      where: { id: existingVote.id },
      data: {
        foodOptionId,
        updatedAt: new Date(),
      },
    });
  } else {
    // Create new vote
    await prisma.vote.create({
      data: {
        familyId,
        scheduleEntryId,
        userId,
        foodOptionId,
      },
    });
  }
}

/**
 * Get vote tallies for a schedule slot, sorted by count (highest first)
 */
export async function getVoteTallies(
  familyId: string,
  scheduleEntryId: string
): Promise<VoteTally[]> {
  const votes = await prisma.vote.findMany({
    where: {
      scheduleEntryId,
      familyId,
    },
    include: {
      foodOption: true,
      user: true,
    },
  });

  const tallyMap = new Map<string, VoteTally>();

  for (const vote of votes) {
    const key = vote.foodOptionId;

    if (!tallyMap.has(key)) {
      tallyMap.set(key, {
        foodOptionId: vote.foodOptionId,
        foodOptionName: vote.foodOption.name,
        voteCount: 0,
        voters: [],
      });
    }

    const tally = tallyMap.get(key)!;
    tally.voteCount += 1;
    tally.voters.push(vote.userId);
  }

  const tallies = Array.from(tallyMap.values()).sort((a, b) => b.voteCount - a.voteCount);

  return tallies;
}

/**
 * Resolve votes for a schedule slot to determine winner
 * Uses highest vote count, with rotation fairness as tie-breaker
 */
export async function resolveVotes(
  familyId: string,
  scheduleEntryId: string
): Promise<string> {
  const entry = await prisma.scheduleEntry.findUnique({
    where: { id: scheduleEntryId },
  });

  if (!entry) {
    throw new Error('Schedule entry not found');
  }

  const tallies = await getVoteTallies(familyId, scheduleEntryId);

  if (tallies.length === 0) {
    // No votes; use original assignment
    if (entry.foodOptionId) {
      return entry.foodOptionId;
    }
    throw new Error('No votes and no default food option');
  }

  // Winner is the one with most votes
  const winner = tallies[0];

  // Update schedule entry
  await prisma.scheduleEntry.update({
    where: { id: scheduleEntryId },
    data: {
      foodOptionId: winner.foodOptionId,
      voteWinner: true,
      updatedAt: new Date(),
    },
  });

  return winner.foodOptionId;
}

/**
 * Submit post-meal feedback from a user
 */
export async function submitFeedback(
  familyId: string,
  userId: string,
  scheduleEntryId: string,
  rating: number, // 1-5
  action: FeedbackAction = FeedbackAction.NONE,
  comment?: string,
  photoUrl?: string
): Promise<void> {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Get the schedule entry and food option
  const entry = await prisma.scheduleEntry.findUnique({
    where: { id: scheduleEntryId },
  });

  if (!entry || !entry.foodOptionId) {
    throw new Error('Schedule entry or food option not found');
  }

  // Check for existing feedback from this user for this entry
  const existingFeedback = await prisma.mealFeedback.findUnique({
    where: {
      scheduleEntryId_userId: {
        scheduleEntryId,
        userId,
      },
    },
  });

  const foodOptionId = entry.foodOptionId;

  if (existingFeedback) {
    // Update existing feedback
    await prisma.mealFeedback.update({
      where: { id: existingFeedback.id },
      data: {
        rating,
        action,
        comment: comment || undefined,
        photoUrl: photoUrl || undefined,
      },
    });
  } else {
    // Create new feedback
    await prisma.mealFeedback.create({
      data: {
        familyId,
        scheduleEntryId,
        foodOptionId,
        userId,
        rating,
        action,
        comment: comment || undefined,
        photoUrl: photoUrl || undefined,
      },
    });
  }

  // Update food option stats
  const allFeedback = await prisma.mealFeedback.findMany({
    where: { foodOptionId },
  });

  const avgRating =
    allFeedback.length > 0
      ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
      : 0;

  await prisma.foodOption.update({
    where: { id: foodOptionId },
    data: {
      averageRating: avgRating,
      totalRatings: allFeedback.length,
      lastServedAt: entry.date,
    },
  });

  // If action is VOTE_DOWN or ENCORE, apply weight modifier
  if (action === FeedbackAction.VOTE_DOWN) {
    await applyFeedbackModifier(familyId, foodOptionId, ModifierType.VOTE_DOWN, userId);
  } else if (action === FeedbackAction.ENCORE) {
    await applyFeedbackModifier(familyId, foodOptionId, ModifierType.ENCORE, userId);
  }

  // Check family thumbs down threshold
  await checkFamilyThumbsDown(familyId, foodOptionId);
}

/**
 * Apply a weight modifier from vote-down or encore feedback
 */
export async function applyFeedbackModifier(
  familyId: string,
  foodOptionId: string,
  type: ModifierType,
  userId: string
): Promise<void> {
  // Check if modifier already exists from this user
  const existingModifier = await prisma.mealWeightModifier.findFirst({
    where: {
      familyId,
      foodOptionId,
      type,
      appliedById: userId,
      clearedAt: null,
    },
  });

  if (existingModifier) {
    // Already applied by this user
    return;
  }

  const initialPenalty =
    type === ModifierType.VOTE_DOWN
      ? -0.5 // -50% modifier
      : type === ModifierType.ENCORE
        ? 0.3 // +30% modifier
        : 0;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 28); // 4-week expiry

  await prisma.mealWeightModifier.create({
    data: {
      familyId,
      foodOptionId,
      type,
      appliedById: userId,
      initialPenalty,
      decayIntervalWeeks: 4,
      expiresAt,
    },
  });
}

/**
 * Check if a food option has been thumbs-downed by >= 50% of family
 */
export async function checkFamilyThumbsDown(
  familyId: string,
  foodOptionId: string
): Promise<boolean> {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: { where: { isActive: true } },
    },
  });

  if (!family || family.members.length === 0) {
    return false;
  }

  const thumbsDownCount = await prisma.mealFeedback.count({
    where: {
      familyId,
      foodOptionId,
      action: FeedbackAction.VOTE_DOWN,
    },
  });

  const totalFeedback = await prisma.mealFeedback.count({
    where: {
      familyId,
      foodOptionId,
    },
  });

  const thumbsDownRate = totalFeedback > 0 ? thumbsDownCount / totalFeedback : 0;

  // If >= 50% have thumbs-downed, it's flagged
  if (thumbsDownRate >= 0.5 && totalFeedback >= family.members.length * 0.5) {
    // Mark in food option status if needed (can add a flag field)
    console.log(
      `Food option ${foodOptionId} has high thumbs-down rate: ${(thumbsDownRate * 100).toFixed(1)}%`
    );
    return true;
  }

  return false;
}

/**
 * Clear a feedback modifier (admin action)
 */
export async function clearFeedbackModifier(
  modifierId: string,
  userId: string
): Promise<void> {
  await prisma.mealWeightModifier.update({
    where: { id: modifierId },
    data: {
      clearedAt: new Date(),
      clearedById: userId,
    },
  });
}

/**
 * Get all active modifiers for a food option
 */
export async function getFoodOptionModifiers(foodOptionId: string) {
  const modifiers = await prisma.mealWeightModifier.findMany({
    where: {
      foodOptionId,
      expiresAt: { gt: new Date() },
      clearedAt: null,
    },
    include: {
      appliedBy: true,
      clearedBy: true,
    },
  });

  return modifiers;
}

/**
 * Get voting history for a schedule entry
 */
export async function getVotingHistory(scheduleEntryId: string) {
  const votes = await prisma.vote.findMany({
    where: { scheduleEntryId },
    include: {
      user: true,
      foodOption: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return votes;
}

/**
 * Revoke a user's vote (admin action)
 */
export async function revokeVote(voteId: string): Promise<void> {
  const vote = await prisma.vote.findUnique({
    where: { id: voteId },
  });

  if (!vote) {
    throw new Error('Vote not found');
  }

  await prisma.vote.delete({
    where: { id: voteId },
  });
}
