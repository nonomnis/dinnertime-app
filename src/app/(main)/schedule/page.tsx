'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  Button,
  LoadingSpinner,
  EmptyState,
  WeekCalendar,
  DayCard,
} from '@/components';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useRouter } from 'next/navigation';

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

interface ScheduleEntry {
  id: string;
  date: string;
  foodOption: any;
  isLocked: boolean;
}

export default function SchedulePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekDate, setCurrentWeekDate] = useState(startOfWeek(new Date()));
  const [isParent, setIsParent] = useState(false);

  const familyId = (session?.user as any)?.familyId;
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    setIsParent(userRole === 'ADMIN' || userRole === 'MEMBER');
  }, [userRole]);

  useEffect(() => {
    if (familyId) {
      fetchSchedule();
    }
  }, [familyId, currentWeekDate]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/schedule?familyId=${familyId}&week=${format(
          currentWeekDate,
          'yyyy-W'
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setScheduleEntries(data.entries || []);

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
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      const response = await fetch('/api/schedule/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId }),
      });
      if (response.ok) {
        await fetchSchedule();
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
    }
  };

  const handleReroll = async () => {
    try {
      const response = await fetch('/api/schedule/reroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          week: format(currentWeekDate, 'yyyy-W'),
        }),
      });
      if (response.ok) {
        await fetchSchedule();
      }
    } catch (error) {
      console.error('Error rerolling schedule:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const hasSchedule = scheduleEntries.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Schedule</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              viewMode === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              viewMode === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      {viewMode === 'week' && (
        <WeekCalendar
          startDate={currentWeekDate}
          onWeekChange={setCurrentWeekDate}
          days={weekDays}
        />
      )}

      {/* Actions */}
      {isParent && (
        <div className="flex gap-2">
          {!hasSchedule && (
            <Button
              variant="primary"
              onClick={handleGenerateSchedule}
              fullWidth
            >
              Generate Schedule
            </Button>
          )}
          {hasSchedule && (
            <Button variant="secondary" onClick={handleReroll} fullWidth>
              Re-roll Week
            </Button>
          )}
        </div>
      )}

      {/* Schedule List */}
      {viewMode === 'week' && (
        <div className="space-y-3">
          {weekDays.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No Meals Scheduled"
              description="Start by generating a schedule for your family"
            />
          ) : (
            weekDays.map((day) => (
              <DayCard
                key={day.dateNum}
                date={day.date}
                meal={day.meal}
                isLocked={day.isLocked}
                votesOpen={day.votesOpen}
                onClick={() => router.push(`/vote`)}
              />
            ))
          )}
        </div>
      )}

      {/* Month View Placeholder */}
      {viewMode === 'month' && (
        <Card variant="flat" className="text-center py-8">
          <p className="text-neutral-600">Month view coming soon</p>
        </Card>
      )}
    </div>
  );
}
