'use client';

import React from 'react';
import { Lock, Clock, UtensilsCrossed } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MEAL_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

interface DayCardProps {
  date: Date;
  meal?: {
    id: string;
    name: string;
    category?: string;
    image?: string | null;
    prepTime?: number;
  };
  isEatOut?: boolean;
  isLocked?: boolean;
  votesOpen?: number;
  onClick?: () => void;
  className?: string;
}

const getCategoryLabel = (category?: string) => {
  const categoryInfo = MEAL_CATEGORIES.find((c) => c.value === category);
  return categoryInfo?.label || category;
};

export const DayCard: React.FC<DayCardProps> = ({
  date,
  meal,
  isEatOut = false,
  isLocked = false,
  votesOpen = 0,
  onClick,
  className,
}) => {
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card
      interactive={!!onClick}
      onClick={onClick}
      variant="elevated"
      className={cn('overflow-hidden', className)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-neutral-900">{dateLabel}</h3>
          {isLocked && (
            <div className="flex items-center gap-1 text-sm text-neutral-600">
              <Lock size={16} />
              Locked
            </div>
          )}
        </div>

        {isEatOut ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <UtensilsCrossed size={32} className="text-secondary-600" />
            <div>
              <h4 className="font-bold text-neutral-900 mb-1">Eat Out Night!</h4>
              <p className="text-sm text-neutral-600">
                No cooking tonight. Enjoy dining out!
              </p>
            </div>
          </div>
        ) : meal ? (
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {meal.image ? (
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-neutral-200 flex items-center justify-center">
                  <span className="text-xs font-semibold text-neutral-600">
                    No image
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <h4 className="font-bold text-neutral-900 line-clamp-2">
                {meal.name}
              </h4>

              {meal.category && (
                <Badge
                  variant={meal.category.toLowerCase() as any}
                  size="sm"
                >
                  {getCategoryLabel(meal.category)}
                </Badge>
              )}

              {meal.prepTime && (
                <div className="flex items-center gap-1 text-sm text-neutral-600">
                  <Clock size={14} />
                  {meal.prepTime} min
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-neutral-600 font-medium">No dinner planned</p>
            <p className="text-xs text-neutral-500 mt-1">
              Tap to add a meal or plan later
            </p>
          </div>
        )}

        {votesOpen > 0 && !isLocked && (
          <div className="pt-3 border-t border-neutral-200">
            <p className="text-sm text-accent-800 font-semibold">
              {votesOpen} open vote{votesOpen > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

DayCard.displayName = 'DayCard';
