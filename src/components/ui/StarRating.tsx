'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  maxValue?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  maxValue = 5,
  onChange,
  readOnly = false,
  size = 'md',
  className,
  showValue = true,
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const sizeMap = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const displayValue = hoverValue ?? value;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-1">
        {Array.from({ length: maxValue }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => setHoverValue(null)}
            onTouchEnd={() => !readOnly && onChange?.(star)}
            className={cn(
              'transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center',
              readOnly && 'cursor-default',
              !readOnly && 'hover:scale-110'
            )}
            disabled={readOnly}
            aria-label={`${star} stars`}
          >
            <Star
              size={20}
              className={cn(
                sizeMap[size],
                star <= displayValue
                  ? 'fill-accent-400 text-accent-400'
                  : 'text-neutral-300'
              )}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-neutral-700 ml-1">
          {displayValue.toFixed(1)}
        </span>
      )}
    </div>
  );
};

StarRating.displayName = 'StarRating';
