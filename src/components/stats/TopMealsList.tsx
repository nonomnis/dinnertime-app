'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';
import { cn } from '@/lib/utils';

interface Meal {
  id: string;
  name: string;
  rating: number;
  timesServed: number;
  image?: string | null;
}

interface TopMealsListProps {
  topMeals: Meal[];
  bottomMeals?: Meal[];
  className?: string;
}

export const TopMealsList: React.FC<TopMealsListProps> = ({
  topMeals,
  bottomMeals = [],
  className,
}) => {
  const [activeTab, setActiveTab] = React.useState<'top' | 'bottom'>('top');

  const meals = activeTab === 'top' ? topMeals : bottomMeals;
  const title = activeTab === 'top' ? 'Top Rated Meals' : 'Lowest Rated Meals';

  return (
    <Card className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
        <div className="flex gap-2 bg-neutral-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('top')}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-[36px]',
              activeTab === 'top'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            Top 10
          </button>
          {bottomMeals.length > 0 && (
            <button
              onClick={() => setActiveTab('bottom')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-[36px]',
                activeTab === 'bottom'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              Bottom 10
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {meals.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-neutral-500 text-sm">
              {activeTab === 'top'
                ? 'No meals to rank yet'
                : 'No data available'}
            </p>
          </div>
        ) : (
          meals.map((meal, index) => (
            <div
              key={meal.id}
              className="flex items-center gap-3 pb-3 border-b border-neutral-100 last:border-b-0 last:pb-0"
            >
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0',
                activeTab === 'top'
                  ? 'bg-accent-500'
                  : 'bg-red-500'
              )}>
                #{index + 1}
              </div>

              <div className="flex-1 min-w-0">
                {meal.image && (
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-10 h-10 rounded-lg object-cover inline-block mr-3 align-middle"
                  />
                )}
                <div className="inline-block">
                  <h4 className="font-medium text-neutral-900 truncate">
                    {meal.name}
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Served {meal.timesServed} time{meal.timesServed > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <StarRating
                  value={meal.rating}
                  readOnly
                  showValue
                  size="sm"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

TopMealsList.displayName = 'TopMealsList';
