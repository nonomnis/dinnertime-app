'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

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

interface WeekCalendarProps {
  startDate: Date;
  onWeekChange: (date: Date) => void;
  onDayClick?: (date: Date) => void;
  days: WeekDay[];
  className?: string;
}

export const WeekCalendar: React.FC<WeekCalendarProps> = ({
  startDate,
  onWeekChange,
  onDayClick,
  days,
  className,
}) => {
  const today = new Date();

  const goToPreviousWeek = () => {
    onWeekChange(addDays(startDate, -7));
  };

  const goToNextWeek = () => {
    onWeekChange(addDays(startDate, 7));
  };

  const weekEndDate = addDays(startDate, 6);
  const weekLabel = `${format(startDate, 'MMM d')} - ${format(weekEndDate, 'MMM d')}`;

  return (
    <div className={cn('w-full flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousWeek}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Previous week"
        >
          <ChevronLeft size={24} className="text-neutral-600" />
        </button>

        <h3 className="text-center font-semibold text-neutral-900">
          {weekLabel}
        </h3>

        <button
          onClick={goToNextWeek}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Next week"
        >
          <ChevronRight size={24} className="text-neutral-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const isToday = isSameDay(day.date, today);
          const isActive = isSameDay(day.date, new Date());

          return (
            <button
              key={index}
              onClick={() => onDayClick?.(day.date)}
              className={cn(
                'flex flex-col items-center gap-2 p-2 rounded-lg transition-all min-h-[120px]',
                'active:scale-95 hover:shadow-md',
                isToday
                  ? 'bg-primary-600 text-white ring-2 ring-primary-400'
                  : 'bg-white border border-neutral-200'
              )}
            >
              <span className="text-xs font-semibold text-center">
                {day.dayName.slice(0, 3)}
              </span>
              <span
                className={cn(
                  'text-lg font-bold',
                  isToday ? 'text-white' : 'text-neutral-900'
                )}
              >
                {day.dateNum}
              </span>

              {day.isLocked && (
                <Lock size={16} className={isToday ? 'text-white' : 'text-neutral-400'} />
              )}

              {day.meal ? (
                <div className="w-full flex-1 flex flex-col items-center justify-center gap-1">
                  {day.meal.image && (
                    <img
                      src={day.meal.image}
                      alt={day.meal.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  {day.meal.isEatOut && (
                    <span className="text-xs font-semibold text-secondary-600">
                      Eat Out
                    </span>
                  )}
                </div>
              ) : (
                <div className={cn(
                  'text-xs font-medium',
                  isToday ? 'text-white/80' : 'text-neutral-400'
                )}>
                  No meal
                </div>
              )}

              {day.votesOpen && !day.isLocked && (
                <span className={cn(
                  'text-xs font-bold bg-accent-400 text-accent-900 px-2 py-0.5 rounded-full',
                  isToday && 'opacity-90'
                )}>
                  {day.votesOpen} votes
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

WeekCalendar.displayName = 'WeekCalendar';
