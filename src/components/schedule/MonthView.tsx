'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, getDay, isSameDay } from 'date-fns';
import { MEAL_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

interface MonthDay {
  date: Date;
  category?: string;
  hasEatOut?: boolean;
  hasMeal?: boolean;
}

interface MonthViewProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDayClick?: (date: Date) => void;
  days: MonthDay[];
  className?: string;
}

const getCategoryColor = (category?: string) => {
  const categoryInfo = MEAL_CATEGORIES.find((c) => c.value === category);
  switch (category) {
    case 'BREAKFAST':
      return 'bg-yellow-500';
    case 'LUNCH':
      return 'bg-blue-500';
    case 'DINNER':
      return 'bg-purple-500';
    case 'SNACK':
      return 'bg-orange-500';
    default:
      return 'bg-neutral-400';
  }
};

export const MonthView: React.FC<MonthViewProps> = ({
  currentMonth,
  onMonthChange,
  onDayClick,
  days,
  className,
}) => {
  const monthLabel = format(currentMonth, 'MMMM yyyy');
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayOfWeek = getDay(firstDayOfMonth);
  const daysInMonth = getDaysInMonth(currentMonth);
  const today = new Date();

  const goToPreviousMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getDayIndex = (dayOfMonth: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayOfMonth);
    return days.findIndex((md) => isSameDay(md.date, d));
  };

  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn('w-full flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Previous month"
        >
          <ChevronLeft size={24} className="text-neutral-600" />
        </button>

        <h3 className="text-center font-bold text-neutral-900 min-w-40">
          {monthLabel}
        </h3>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Next month"
        >
          <ChevronRight size={24} className="text-neutral-600" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-neutral-200">
          {weekDayLabels.map((label) => (
            <div
              key={label}
              className="bg-neutral-100 p-3 text-center text-xs font-bold text-neutral-700"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-neutral-200">
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="bg-neutral-50 p-3 aspect-square"
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayOfMonth = i + 1;
            const dayIndex = getDayIndex(dayOfMonth);
            const dayData = dayIndex >= 0 ? days[dayIndex] : undefined;
            const isToday = isSameDay(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayOfMonth),
              today
            );

            return (
              <button
                key={dayOfMonth}
                onClick={() =>
                  onDayClick?.(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayOfMonth)
                  )
                }
                className={cn(
                  'bg-white p-3 aspect-square flex flex-col items-center justify-center gap-1',
                  'hover:bg-neutral-50 active:bg-neutral-100 transition-colors',
                  'border border-neutral-200 border-t-0 border-l-0',
                  'last:border-r',
                  isToday && 'ring-inset ring-2 ring-primary-500 border-primary-500'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isToday ? 'text-primary-600' : 'text-neutral-900'
                  )}
                >
                  {dayOfMonth}
                </span>
                {dayData?.hasMeal && (
                  <div className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    getCategoryColor(dayData.category)
                  )} />
                )}
                {dayData?.hasEatOut && (
                  <div className="h-1.5 w-1.5 rounded-full bg-secondary-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

MonthView.displayName = 'MonthView';
