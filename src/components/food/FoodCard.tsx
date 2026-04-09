'use client';

import React from 'react';
import { Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';
import { MEAL_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

interface FoodCardProps {
  id: string;
  name: string;
  category: string;
  prepTime?: number;
  image?: string | null;
  rating?: number;
  timesServed?: number;
  onClick?: () => void;
  variant?: 'compact' | 'full';
  className?: string;
}

const getCategoryColor = (category: string) => {
  const categoryInfo = MEAL_CATEGORIES.find((c) => c.value === category);
  return categoryInfo?.color || 'bg-neutral-100 text-neutral-800';
};

const getCategoryLabel = (category: string) => {
  const categoryInfo = MEAL_CATEGORIES.find((c) => c.value === category);
  return categoryInfo?.label || category;
};

export const FoodCard: React.FC<FoodCardProps> = ({
  id,
  name,
  category,
  prepTime,
  image,
  rating = 0,
  timesServed = 0,
  onClick,
  variant = 'full',
  className,
}) => {
  const categoryColor = getCategoryColor(category);
  const categoryLabel = getCategoryLabel(category);

  if (variant === 'compact') {
    return (
      <Card
        interactive={!!onClick}
        onClick={onClick}
        className={cn(
          'flex flex-col gap-3 cursor-pointer',
          'hover:shadow-md transition-all',
          className
        )}
      >
        <div className="relative w-full aspect-square rounded-lg bg-neutral-200 overflow-hidden flex-shrink-0">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={cn('w-full h-full flex items-center justify-center', categoryColor)}
            >
              <span className="text-sm font-semibold text-center px-2">
                {categoryLabel}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-neutral-900 line-clamp-2">{name}</h3>
          <div className="flex gap-2">
            <Badge variant={category.toLowerCase() as any} size="sm">
              {categoryLabel}
            </Badge>
          </div>
          {rating > 0 && (
            <StarRating value={rating} readOnly showValue={false} size="sm" />
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      interactive={!!onClick}
      onClick={onClick}
      className={cn('flex flex-col gap-4', className)}
    >
      <div className="relative w-full aspect-video rounded-lg bg-neutral-200 overflow-hidden flex-shrink-0">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center',
              categoryColor
            )}
          >
            <span className="text-sm font-semibold">{categoryLabel}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 line-clamp-2">
            {name}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={category.toLowerCase() as any} size="md">
            {categoryLabel}
          </Badge>
        </div>

        <div className="flex flex-col gap-2">
          {prepTime && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Clock size={16} />
              <span>{prepTime} min</span>
            </div>
          )}
          {rating > 0 && (
            <div className="flex items-center gap-2">
              <StarRating value={rating} readOnly showValue size="md" />
            </div>
          )}
          {timesServed > 0 && (
            <p className="text-xs text-neutral-500">
              Served {timesServed} time{timesServed > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

FoodCard.displayName = 'FoodCard';
