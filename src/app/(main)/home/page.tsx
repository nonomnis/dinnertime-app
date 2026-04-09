'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  Button,
  Badge,
  LoadingSpinner,
  EmptyState,
  WeekCalendar,
  FeedbackCard,
} from '@/components';
import { Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useRouter } from 'next/navigation';

interface TodaysMeal {
  id: string;
  name: string;
  image?: string | null;
  category: string;
  prepTime?: number;
  isEatOut?: boolean;
}

interface WeekDay {
  date: Date;
  dayName: string;
  dateNum: string;
  meal?: {
    id: string;
    name: string;
    image?: string | null;
    isEatOut?: boolean;
  };
  isLocked?: boolean;
  votesOpen?: number;
}

interface PendingMeal {
  id: string;
  name: string;
  image?: string | null;
  scheduledDate: string;
}

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [todaysMeal, setTodaysMeal] = useState<TodaysMeal | null>(null);
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState<PendingMeal[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekDate, setCurrentWeekDate] = useState(startOfWeek(new Date()));

  const familyId = (session?.user as any)?.familyId;

  useEffect(() => {
    if (familyId) {
      Promise.all([
        fetchTodaysMeal(),
        fetchWeekSchedule(),
        fetchPendingFeedback(),
        fetchStats(),
      ]).finally(() => setLoading(false));
    }
  }, [familyId]);

  const fetchTodaysMeal = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await fetch(
        `/api/schedule?familyId=${familyId}&date=${today}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.entries && data.entries.length > 0) {
          const meal = data.entries[0].foodOption;
          if (meal) {
            setTodaysMeal({
              id: meal.id,
              name: meal.name,
              image: meal.image,
              category: meal.category,
              prepTime: meal.prepTime,
              isEatOut: meal.isEatOut,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching today meal:', error);
    }
  };

  const fetchWeekSchedule = async () => {
    try {
      const response = await fetch(
        `/api/schedule?familyId=${familyId}&week=${format(
          currentWeekDate,
          'yyyy-W'
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        const days: WeekDay[] = [];
        for (let i = 0; i < 7; i++) {
          const date = addDays(currentWeekDate, i);
          const entry = data.entries?.find((e: any) =>
            isSameDay(new Date(e.date), date)
          );
          days.push({
            date,
            dayName: format(date, 'EEEE'),
            dateNum: format(date, 'd'),
            meal: entry?.foodOption
              ? {
                  id: entry.foodOption.id,
                  name: entry.foodOption.name,
                  image: entry.foodOption.image,
                  isEatOut: entry.foodOption.isEatOut,
                }
              : undefined,
            isLocked: entry?.isLocked,
            votesOpen: entry?.votesOpen,
          });
        }
        setWeekDays(days);
      }
    } catch (error) {
      console.error('Error fetching week schedule:', error);
    }
  };

  const fetchPendingFeedback = async () => {
    try {
      const response = await fetch(`/api/feedback?familyId=${familyId}`);
      if (response.ok) {
        const data = await response.json();
        const pending = data.filter(
          (f: any) =>
            !f.ratingSubmitted &&
            new Date(f.scheduledDate) >
              new Date(Date.now() - 48 * 60 * 60 * 1000)
        );
        setPendingFeedback(pending);
      }
    } catch (error) {
      console.error('Error fetching pending feedback:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats?familyId=${familyId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFeedbackSubmit = async (feedbackData: any) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedbackData,
          familyId,
        }),
      });
      fetchPendingFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {getGreeting()}, {session?.user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      {/* Today's Dinner Hero Card */}
      {todaysMeal ? (
        <Card
          variant="elevated"
          className="flex flex-col gap-3 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => router.push('/schedule')}
        >
          {todaysMeal.image && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <img
                src={todaysMeal.image}
                alt={todaysMeal.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-neutral-600 uppercase font-semibold">
                Tonight's Dinner
              </p>
              <h2 className="text-xl font-bold text-neutral-900 mt-1">
                {todaysMeal.name}
              </h2>
            </div>
            <ChevronRight className="text-primary-600 flex-shrink-0" />
          </div>
          <div className="flex flex-wrap gap-2">
            {todaysMeal.isEatOut && (
              <Badge variant="secondary" size="sm">
                🍽️ Eat Out
              </Badge>
            )}
            {todaysMeal.category && (
              <Badge variant={todaysMeal.category.toLowerCase()} size="sm">
                {todaysMeal.category}
              </Badge>
            )}
            {todaysMeal.prepTime && (
              <div className="flex items-center gap-1 text-xs text-neutral-600">
                <Clock size={14} />
                <span>{todaysMeal.prepTime} min</span>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card variant="flat" className="text-center py-8">
          <AlertCircle className="mx-auto text-neutral-400 mb-2" size={32} />
          <h3 className="font-semibold text-neutral-900">Nothing Planned</h3>
          <p className="text-sm text-neutral-600 mt-1">
            Schedule a meal for today to get started
          </p>
        </Card>
      )}

      {/* This Week Calendar */}
      {weekDays.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-3">
            This Week
          </h3>
          <WeekCalendar
            startDate={currentWeekDate}
            onWeekChange={setCurrentWeekDate}
            days={weekDays}
            onDayClick={() => router.push('/schedule')}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {pendingFeedback.length > 0 && (
          <Button
            variant="primary"
            onClick={() => router.push('/feedback')}
            fullWidth
          >
            Rate Meals
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => router.push('/grocery')}
          fullWidth
        >
          Grocery List
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/library')}
          fullWidth
        >
          Add Meal
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push('/stats')}
          fullWidth
        >
          Stats
        </Button>
      </div>

      {/* Pending Feedback */}
      {pendingFeedback.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-3">
            Rate Your Meals
          </h3>
          <div className="space-y-3">
            {pendingFeedback.slice(0, 2).map((meal) => (
              <FeedbackCard
                key={meal.id}
                mealId={meal.id}
                mealName={meal.name}
                mealImage={meal.image}
                onSubmit={handleFeedbackSubmit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <Card variant="flat" className="text-center">
            <p className="text-2xl font-bold text-primary-600">
              {stats.totalMeals || 0}
            </p>
            <p className="text-xs text-neutral-600 mt-1">Meals Served</p>
          </Card>
          <Card variant="flat" className="text-center">
            <p className="text-2xl font-bold text-secondary-600">
              {stats.streak || 0}
            </p>
            <p className="text-xs text-neutral-600 mt-1">Week Streak</p>
          </Card>
        </div>
      )}
    </div>
  );
}
