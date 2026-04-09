'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { VoteCard } from './VoteCard';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface FoodOption {
  id: string;
  name: string;
  category?: string;
  image?: string | null;
  voteCount?: number;
}

interface VoteSlotProps {
  scheduleEntryId: string;
  date: Date;
  foodOptions: FoodOption[];
  selectedVoteId?: string;
  onVote?: (foodOptionId: string) => void | Promise<void>;
  closesAt?: Date;
  className?: string;
}

export const VoteSlot: React.FC<VoteSlotProps> = ({
  scheduleEntryId,
  date,
  foodOptions,
  selectedVoteId,
  onVote,
  closesAt,
  className,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const timeUntilClose = closesAt
    ? Math.max(0, Math.floor((closesAt.getTime() - Date.now()) / 1000 / 60))
    : null;

  const handleVote = async (foodOptionId: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onVote?.(foodOptionId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('w-full flex flex-col gap-4', className)}>
      <Card variant="flat">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-neutral-900">
            {dateLabel}
          </h3>

          {selectedVoteId && (
            <div className="px-3 py-2 bg-primary-100 text-primary-800 rounded-lg">
              <p className="text-sm font-semibold">
                Your vote:
                {' '}
                <span className="font-bold">
                  {foodOptions.find((f) => f.id === selectedVoteId)?.name}
                </span>
              </p>
            </div>
          )}

          {closesAt && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Clock size={16} />
              <span>
                {timeUntilClose && timeUntilClose > 0
                  ? `Voting closes in ${timeUntilClose} minutes`
                  : 'Voting closed'}
              </span>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {foodOptions.map((option) => (
          <VoteCard
            key={option.id}
            id={option.id}
            name={option.name}
            category={option.category}
            image={option.image}
            voteCount={option.voteCount}
            isSelected={selectedVoteId === option.id}
            onVote={() => handleVote(option.id)}
          />
        ))}
      </div>
    </div>
  );
};

VoteSlot.displayName = 'VoteSlot';
