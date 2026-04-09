'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  LoadingSpinner,
  EmptyState,
  CategoryChart,
  TopMealsList,
  RatingTrendChart,
} from '@/components';
import { TrendingUp, Users } from 'lucide-react';

interface Stats {
  totalMeals: number;
  averageRating: number;
  currentStreak: number;
  participationRate: number;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  topMeals: Array<{
    id: string;
    name: string;
    rating: number;
    timesServed: number;
  }>;
  bottomMeals: Array<{
    id: string;
    name: string;
    rating: number;
    timesServed: number;
  }>;
  ratingTrend: Array<{
    date: string;
    averageRating: number;
    mealCount: number;
  }>;
  memberParticipation: Array<{
    id: string;
    name: string;
    votesCount: number;
    feedbackCount: number;
  }>;
}

export default function StatsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30' | '90' | 'all'>('30');
  const [showTopMeals, setShowTopMeals] = useState(true);

  const familyId = (session?.user as any)?.familyId;

  useEffect(() => {
    if (familyId) {
      fetchStats();
    }
  }, [familyId, timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/stats?familyId=${familyId}&timeRange=${timeRange}`
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <EmptyState
        icon="📊"
        title="No Statistics Yet"
        description="Start logging meals and feedback to see statistics"
      />
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Statistics</h1>
        <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
          {(['30', '90', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 rounded text-sm font-semibold transition-colors ${
                timeRange === range
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600'
              }`}
            >
              {range === '30' ? '30d' : range === '90' ? '90d' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card variant="elevated" className="text-center py-6">
          <p className="text-3xl font-bold text-primary-600">
            {stats.totalMeals}
          </p>
          <p className="text-xs text-neutral-600 mt-2 uppercase font-semibold">
            Meals Served
          </p>
        </Card>

        <Card variant="elevated" className="text-center py-6">
          <p className="text-3xl font-bold text-secondary-600">
            {stats.averageRating.toFixed(1)}
          </p>
          <p className="text-xs text-neutral-600 mt-2 uppercase font-semibold">
            Avg Rating
          </p>
        </Card>

        <Card variant="elevated" className="text-center py-6">
          <p className="text-3xl font-bold text-warm-600">
            {stats.currentStreak}
          </p>
          <p className="text-xs text-neutral-600 mt-2 uppercase font-semibold">
            Week Streak
          </p>
        </Card>

        <Card variant="elevated" className="text-center py-6">
          <p className="text-3xl font-bold text-accent-600">
            {Math.round(stats.participationRate)}%
          </p>
          <p className="text-xs text-neutral-600 mt-2 uppercase font-semibold">
            Participation
          </p>
        </Card>
      </div>

      {/* Category Distribution */}
      {stats.categoryDistribution.length > 0 && (
        <Card variant="elevated">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">
            Category Mix
          </h3>
          <CategoryChart data={stats.categoryDistribution} />
        </Card>
      )}

      {/* Rating Trend */}
      {stats.ratingTrend.length > 0 && (
        <Card variant="elevated">
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Rating Trend
          </h3>
          <RatingTrendChart data={stats.ratingTrend} />
        </Card>
      )}

      {/* Top/Bottom Meals */}
      <Card variant="elevated">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowTopMeals(true)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              showTopMeals
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            Top 10 Meals
          </button>
          <button
            onClick={() => setShowTopMeals(false)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              !showTopMeals
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            Bottom 10 Meals
          </button>
        </div>
        <TopMealsList
          meals={showTopMeals ? stats.topMeals : stats.bottomMeals}
        />
      </Card>

      {/* Member Participation */}
      {stats.memberParticipation.length > 0 && (
        <Card variant="elevated">
          <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Users size={20} />
            Member Participation
          </h3>
          <div className="space-y-3">
            {stats.memberParticipation.map((member) => (
              <div key={member.id} className="flex items-center justify-between pb-3 border-b border-neutral-100 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-semibold text-neutral-900">{member.name}</p>
                  <p className="text-xs text-neutral-600">
                    {member.votesCount} votes • {member.feedbackCount} ratings
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
