'use client';

import React from 'react';
import { Snowflake, UtensilsCrossed, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

type StorageMethod = 'FREEZER' | 'FRIDGE' | 'ROOM_TEMP' | 'PANTRY';

interface BreakfastPrepCardProps {
  id: string;
  name: string;
  image?: string | null;
  batchYield: number;
  yieldUnit: string;
  storageMethod: StorageMethod;
  shelfLifeDays: number;
  servingsRemaining?: number;
  lastPrepDate?: Date;
  onClick?: () => void;
  className?: string;
}

const getStorageIcon = (method: StorageMethod) => {
  switch (method) {
    case 'FREEZER':
      return <Snowflake size={24} className="text-blue-500" />;
    case 'FRIDGE':
      return <UtensilsCrossed size={24} className="text-blue-400" />;
    case 'ROOM_TEMP':
      return <UtensilsCrossed size={24} className="text-warm-500" />;
    case 'PANTRY':
      return <UtensilsCrossed size={24} className="text-warm-600" />;
    default:
      return <UtensilsCrossed size={24} className="text-neutral-500" />;
  }
};

const getStorageLabel = (method: StorageMethod): string => {
  switch (method) {
    case 'FREEZER':
      return 'Freezer';
    case 'FRIDGE':
      return 'Refrigerator';
    case 'ROOM_TEMP':
      return 'Room Temperature';
    case 'PANTRY':
      return 'Pantry';
    default:
      return 'Storage';
  }
};

export const BreakfastPrepCard: React.FC<BreakfastPrepCardProps> = ({
  id,
  name,
  image,
  batchYield,
  yieldUnit,
  storageMethod,
  shelfLifeDays,
  servingsRemaining,
  lastPrepDate,
  onClick,
  className,
}) => {
  const daysAgo = lastPrepDate
    ? Math.floor(
        (Date.now() - new Date(lastPrepDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const daysUntilExpiry = lastPrepDate
    ? shelfLifeDays -
      (daysAgo ?? 0)
    : null;

  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;
  const isWarning = daysUntilExpiry !== null && daysUntilExpiry <= 2;

  return (
    <Card
      interactive={!!onClick}
      onClick={onClick}
      className={cn(
        'flex flex-col gap-4 overflow-hidden',
        isExpired && 'opacity-60',
        className
      )}
    >
      <div className="flex gap-4 items-start">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🥣</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-neutral-900 line-clamp-2">{name}</h3>
          <p className="text-sm text-neutral-600 mt-1">
            Batch: {batchYield} {yieldUnit}
          </p>
          {servingsRemaining !== undefined && (
            <p className="text-sm text-neutral-600">
              Remaining: {servingsRemaining} servings
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 py-3 border-t border-neutral-200">
        {getStorageIcon(storageMethod)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900">
            {getStorageLabel(storageMethod)}
          </p>
          <p className="text-xs text-neutral-600">
            Keep up to {shelfLifeDays} days
          </p>
        </div>
      </div>

      {lastPrepDate && daysUntilExpiry !== null && (
        <div className="flex items-center gap-3">
          <Clock
            size={18}
            className={cn(
              'flex-shrink-0',
              isExpired
                ? 'text-red-500'
                : isWarning
                  ? 'text-warm-500'
                  : 'text-secondary-500'
            )}
          />
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-medium',
              isExpired
                ? 'text-red-700'
                : isWarning
                  ? 'text-warm-700'
                  : 'text-secondary-700'
            )}>
              {isExpired
                ? 'Expired'
                : isWarning
                  ? `${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''} left`
                  : `${daysUntilExpiry} days remaining`}
            </p>
            {daysAgo !== null && daysAgo > 0 && (
              <p className="text-xs text-neutral-600">
                Prepped {daysAgo} day{daysAgo > 1 ? 's' : ''} ago
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

BreakfastPrepCard.displayName = 'BreakfastPrepCard';
