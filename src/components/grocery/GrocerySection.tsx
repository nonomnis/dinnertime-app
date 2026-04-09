'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  isChecked?: boolean;
  sourceRecipes?: string[];
}

interface GrocerySectionProps {
  sectionName: string;
  items: GroceryItem[];
  onToggleItem?: (itemId: string, checked: boolean) => void;
  className?: string;
}

export const GrocerySection: React.FC<GrocerySectionProps> = ({
  sectionName,
  items,
  onToggleItem,
  className,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const checkedCount = items.filter((item) => item.isChecked).length;

  return (
    <div className={cn('flex flex-col gap-0 border-b border-neutral-200 last:border-b-0', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center justify-between gap-3 p-4 rounded-lg',
          'bg-white hover:bg-neutral-50 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'min-h-[44px]'
        )}
      >
        <div className="flex-1 text-left">
          <h4 className="font-bold text-neutral-900">{sectionName}</h4>
          <p className="text-xs text-neutral-600 mt-0.5">
            {checkedCount} of {items.length} items
          </p>
        </div>

        {isExpanded ? (
          <ChevronUp size={20} className="text-neutral-600" />
        ) : (
          <ChevronDown size={20} className="text-neutral-600" />
        )}
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-2 px-4 py-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 py-2"
            >
              <input
                type="checkbox"
                checked={item.isChecked ?? false}
                onChange={(e) => onToggleItem?.(item.id, e.target.checked)}
                className={cn(
                  'mt-1 h-5 w-5 rounded-md cursor-pointer accent-secondary-600',
                  'min-h-[44px]'
                )}
                aria-label={`Check off ${item.name}`}
              />

              <div className="flex-1 min-w-0">
                <label
                  className={cn(
                    'font-medium transition-colors cursor-pointer block',
                    item.isChecked
                      ? 'line-through text-neutral-400'
                      : 'text-neutral-900'
                  )}
                >
                  {item.name}
                </label>
                <p className={cn(
                  'text-sm transition-colors',
                  item.isChecked ? 'text-neutral-300' : 'text-neutral-600'
                )}>
                  {item.quantity} {item.unit}
                </p>
                {item.sourceRecipes && item.sourceRecipes.length > 0 && (
                  <p className="text-xs text-neutral-500 mt-1">
                    For: {item.sourceRecipes.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

GrocerySection.displayName = 'GrocerySection';
