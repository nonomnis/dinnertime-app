'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { FoodCard } from './FoodCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { MEAL_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

interface Food {
  id: string;
  name: string;
  category: string;
  prepTime?: number;
  image?: string | null;
  rating?: number;
  timesServed?: number;
}

interface FoodGridProps {
  foods: Food[];
  onFoodClick?: (food: Food) => void;
  variant?: 'compact' | 'full';
  showFilters?: boolean;
  className?: string;
}

export const FoodGrid: React.FC<FoodGridProps> = ({
  foods,
  onFoodClick,
  variant = 'full',
  showFilters = true,
  className,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(food.category);
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const gridColsClass =
    variant === 'compact'
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={cn('w-full flex flex-col gap-4', className)}>
      {showFilters && (
        <div className="flex flex-col gap-3 sticky top-0 bg-neutral-50 py-3 z-20">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300',
                'bg-white text-neutral-900 placeholder-neutral-500',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'min-h-[44px]'
              )}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {MEAL_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => toggleCategory(category.value)}
                className={cn(
                  'px-3 py-2 rounded-full text-sm font-medium transition-colors min-h-[36px]',
                  selectedCategories.includes(category.value)
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="text-sm text-primary-600 font-medium flex items-center gap-1 px-3 py-1"
            >
              <X size={16} />
              Clear filters
            </button>
          )}
        </div>
      )}

      {filteredFoods.length === 0 ? (
        <EmptyState
          icon="🍽️"
          title="No meals found"
          description={
            searchQuery || selectedCategories.length > 0
              ? 'Try adjusting your search or filters'
              : 'Add some meals to get started'
          }
        />
      ) : (
        <div className={cn('grid gap-4 w-full', gridColsClass)}>
          {filteredFoods.map((food) => (
            <FoodCard
              key={food.id}
              {...food}
              variant={variant}
              onClick={() => onFoodClick?.(food)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

FoodGrid.displayName = 'FoodGrid';
