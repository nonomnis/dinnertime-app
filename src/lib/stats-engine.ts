import { prisma } from './prisma';
import { MealCategory, FoodOption } from '@prisma/client';

interface MealStats {
  foodOptionId: string;
  foodName: string;
  category: MealCategory;
  timesServed: number;
  averageRating: number;
  totalRatings: number;
  thumbsDownCount: number;
  encoreCount: number;
  lastServed: Date | null;
}

interface CategoryDistribution {
  category: MealCategory;
  percentage: number;
  count: number;
}

interface TopBottomMeal {
  foodOptionId: string;
  foodName: string;
  score: number;
  category: MealCategory;
  averageRating: number;
  timesServed: number;
}

interface MemberParticipation {
  memberId: string;
  memberName: string;
  voteCount: number;
  feedbackCount: number;
  thumbsDownCount: number;
  encoreCount: number;
  voteStreak: number;
}

interface RatingTrend {
  period: string;
  averageRating: number;
  mealCount: number;
}

interface CategoryFatigueAlert {
  category: MealCategory;
  percentage: number;
  mealsInPeriod: number;
}

interface MemberPreferenceProfile {
  memberId: string;
  memberName: string;
  categoryVotes: Map<MealCategory, number>;
  totalVotes: number;
}

interface DashboardSummary {
  totalMembers: number;
  activeMealCount: number;
  plannedMealsThisWeek: number;
  averageRatingThisWeek: number;
  topMealThisWeek: string | null;
  participationRate: number;
}

/**
 * Get meal statistics for one or all meals in a family
 */
export async function getMealStats(
  familyId: string,
  foodOptionId?: string
): Promise<MealStats[]> {
  const where: any = { familyId };
  if (foodOptionId) {
    where.id = foodOptionId;
  }

  const foods = await prisma.foodOption.findMany({
    where,
  });

  const stats: MealStats[] = [];

  for (const food of foods) {
    const thumbsDownCount = await prisma.mealFeedback.count({
      where: {
        familyId,
        foodOptionId: food.id,
        action: 'VOTE_DOWN',
      },
    });

    const encoreCount = await prisma.mealFeedback.count({
      where: {
        familyId,
        foodOptionId: food.id,
        action: 'ENCORE',
      },
    });

    stats.push({
      foodOptionId: food.id,
      foodName: food.name,
      category: food.category,
      timesServed: food.timesServed,
      averageRating: food.averageRating,
      totalRatings: food.totalRatings,
      thumbsDownCount,
      encoreCount,
      lastServed: food.lastServedAt,
    });
  }

  return stats;
}

/**
 * Get percentage breakdown of meals by category for last N days
 */
export async function getCategoryDistribution(
  familyId: string,
  days: number = 30
): Promise<CategoryDistribution[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const entries = await prisma.scheduleEntry.findMany({
    where: {
      familyId,
      type: 'HOME_COOKED',
      date: { gte: startDate },
      foodOption: {
        isNotNot: null,
      },
    },
    include: {
      foodOption: true,
    },
  });

  const categoryCount = new Map<MealCategory, number>();

  for (const entry of entries) {
    if (entry.foodOption) {
      const current = categoryCount.get(entry.foodOption.category) || 0;
      categoryCount.set(entry.foodOption.category, current + 1);
    }
  }

  const total = entries.length;
  const distribution: CategoryDistribution[] = [];

  for (const [category, count] of categoryCount.entries()) {
    distribution.push({
      category,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    });
  }

  return distribution.sort((a, b) => b.count - a.count);
}

/**
 * Get top N and bottom N meals by composite score
 */
export async function getTopBottomMeals(
  familyId: string,
  limit: number = 5
): Promise<{ top: TopBottomMeal[]; bottom: TopBottomMeal[] }> {
  const foods = await prisma.foodOption.findMany({
    where: { familyId },
  });

  const scoredMeals: TopBottomMeal[] = foods
    .filter((f) => f.timesServed > 0) // Only meals that have been served
    .map((food) => ({
      foodOptionId: food.id,
      foodName: food.name,
      score: food.averageRating * 2 + food.timesServed * 0.1, // Composite score
      category: food.category,
      averageRating: food.averageRating,
      timesServed: food.timesServed,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    top: scoredMeals.slice(0, limit),
    bottom: scoredMeals.slice(-limit).reverse(),
  };
}

/**
 * Get per-member vote and feedback statistics
 */
export async function getMemberParticipation(
  familyId: string
): Promise<MemberParticipation[]> {
  const members = await prisma.familyMember.findMany({
    where: { familyId, isActive: true },
    include: {
      user: true,
    },
  });

  const participation: MemberParticipation[] = [];

  for (const member of members) {
    const voteCount = await prisma.vote.count({
      where: {
        familyId,
        userId: member.userId,
      },
    });

    const feedbackCount = await prisma.mealFeedback.count({
      where: {
        familyId,
        userId: member.userId,
      },
    });

    const thumbsDownCount = await prisma.mealFeedback.count({
      where: {
        familyId,
        userId: member.userId,
        action: 'VOTE_DOWN',
      },
    });

    const encoreCount = await prisma.mealFeedback.count({
      where: {
        familyId,
        userId: member.userId,
        action: 'ENCORE',
      },
    });

    // Simple streak: days with feedback in a row (simplified)
    const recentFeedback = await prisma.mealFeedback.findMany({
      where: {
        familyId,
        userId: member.userId,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    let voteStreak = 0;
    if (recentFeedback.length > 0) {
      const now = new Date();
      for (const feedback of recentFeedback) {
        const daysDiff = (now.getTime() - feedback.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff <= voteStreak + 2) {
          voteStreak++;
        } else {
          break;
        }
      }
    }

    participation.push({
      memberId: member.id,
      memberName: member.displayName || member.user.name || member.user.email,
      voteCount,
      feedbackCount,
      thumbsDownCount,
      encoreCount,
      voteStreak,
    });
  }

  return participation;
}

/**
 * Get average ratings over time periods
 */
export async function getRatingTrends(
  familyId: string,
  period: 'week' | 'month' | 'all' = 'month'
): Promise<RatingTrend[]> {
  let startDate = new Date();

  if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else {
    startDate = new Date('2000-01-01'); // All time
  }

  const feedback = await prisma.mealFeedback.findMany({
    where: {
      familyId,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by week or month
  const grouped = new Map<string, { sum: number; count: number }>();

  for (const item of feedback) {
    const date = new Date(item.createdAt);
    let key: string;

    if (period === 'week') {
      // Group by day
      key = date.toISOString().split('T')[0];
    } else if (period === 'month') {
      // Group by week
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      // Group by month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!grouped.has(key)) {
      grouped.set(key, { sum: 0, count: 0 });
    }

    const group = grouped.get(key)!;
    group.sum += item.rating;
    group.count += 1;
  }

  const trends: RatingTrend[] = [];
  for (const [period, data] of grouped.entries()) {
    trends.push({
      period,
      averageRating: data.count > 0 ? data.sum / data.count : 0,
      mealCount: data.count,
    });
  }

  return trends;
}

/**
 * Check for category fatigue (>40% of meals in one category over last 14 days)
 */
export async function getCategoryFatigueAlerts(
  familyId: string
): Promise<CategoryFatigueAlert[]> {
  const distribution = await getCategoryDistribution(familyId, 14);

  return distribution
    .filter((d) => d.percentage > 40)
    .map((d) => ({
      category: d.category,
      percentage: d.percentage,
      mealsInPeriod: d.count,
    }));
}

/**
 * Get member preference profile (radar chart data)
 */
export async function getMemberPreferenceProfile(
  familyId: string,
  userId: string
): Promise<MemberPreferenceProfile> {
  const member = await prisma.familyMember.findFirst({
    where: { familyId, userId },
    include: { user: true },
  });

  if (!member) {
    throw new Error('Member not found');
  }

  const votes = await prisma.vote.findMany({
    where: { familyId, userId },
    include: { foodOption: true },
  });

  const categoryVotes = new Map<MealCategory, number>();

  for (const vote of votes) {
    const current = categoryVotes.get(vote.foodOption.category) || 0;
    categoryVotes.set(vote.foodOption.category, current + 1);
  }

  return {
    memberId: member.id,
    memberName: member.displayName || member.user.name || member.user.email,
    categoryVotes,
    totalVotes: votes.length,
  };
}

/**
 * Get compact dashboard summary for home widget
 */
export async function getDashboardSummary(familyId: string): Promise<DashboardSummary> {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: { where: { isActive: true } },
    },
  });

  if (!family) {
    throw new Error(`Family ${familyId} not found`);
  }

  // Count active meals
  const activeMealCount = await prisma.foodOption.count({
    where: {
      familyId,
      status: 'ACTIVE',
    },
  });

  // Count planned meals this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const plannedMealsThisWeek = await prisma.scheduleEntry.count({
    where: {
      familyId,
      date: { gte: weekStart, lt: weekEnd },
      type: 'HOME_COOKED',
    },
  });

  // Average rating this week
  const feedback = await prisma.mealFeedback.findMany({
    where: {
      familyId,
      createdAt: { gte: weekStart, lt: weekEnd },
    },
  });

  const averageRatingThisWeek =
    feedback.length > 0
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
      : 0;

  // Top meal this week
  const topMealStats = await getMealStats(familyId);
  const topMeal = topMealStats
    .filter((m) => m.timesServed > 0)
    .sort((a, b) => b.averageRating - a.averageRating)[0];

  // Participation rate (members who voted/gave feedback)
  const activeMembersWithActivity = await prisma.familyMember.findMany({
    where: {
      familyId,
      isActive: true,
      user: {
        OR: [
          {
            votes: { some: { familyId } },
          },
          {
            feedback: { some: { familyId } },
          },
        ],
      },
    },
  });

  const participationRate = family.members.length > 0
    ? (activeMembersWithActivity.length / family.members.length) * 100
    : 0;

  return {
    totalMembers: family.members.length,
    activeMealCount,
    plannedMealsThisWeek,
    averageRatingThisWeek: Math.round(averageRatingThisWeek * 10) / 10,
    topMealThisWeek: topMeal?.foodName || null,
    participationRate: Math.round(participationRate),
  };
}
