'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MEAL_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

interface VoteCardProps {
  id: string;
  name: string;
  category?: string;
  image?: string | null;
  voteCount?: number;
  isSelected?: boolean;
  onVote?: () => void;
  className?: string;
}

const getCategoryLabel = (category?: string) => {
  const categoryInfo = MEAL_CATEGORIES.find((c) => c.value === category);
  return categoryInfo?.label || category;
};

export const VoteCard: React.FC<VoteCardProps> = ({
  id,
  name,
  category,
  image,
  voteCount = 0,
  isSelected = false,
  onVote,
  className,
}) => {
  return (
    <motion.div
      whileTap={{ scale: isSelected ? 1 : 0.98 }}
      onClick={onVote}
    >
      <Card
        interactive={!!onVote}
        className={cn(
          'flex flex-col gap-3 cursor-pointer relative overflow-hidden',
          'border-2 transition-all',
          isSelected
            ? 'border-primary-600 bg-primary-50'
            : 'border-neutral-200 hover:border-primary-400'
        )}
      >
        <div className="relative w-full aspect-video rounded-lg bg-neutral-200 overflow-hidden flex-shrink-0">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-300">
              <span className="text-sm font-semibold text-neutral-600">
                {getCategoryLabel(category)}
              </span>
            </div>
          )}

          <motion.div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'bg-primary-600/80 transition-all'
            )}
            animate={{
              opacity: isSelected ? 1 : 0,
              pointerEvents: isSelected ? 'auto' : 'none',
            }}
          >
            <div className="text-white text-center">
              <div className="text-4xl font-bold">✓</div>
              <p className="text-sm font-semibold mt-1">Your Vote</p>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-neutral-900 line-clamp-2">{name}</h3>

          {category && (
            <Badge
              variant={category.toLowerCase() as any}
              size="sm"
            >
              {getCategoryLabel(category)}
            </Badge>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
            <span className="text-xs font-semibold text-neutral-600">
              {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onVote?.();
              }}
              className={cn(
                'px-4 py-2 rounded-lg font-semibold transition-all min-h-[40px]',
                'text-white min-w-[100px]',
                isSelected
                  ? 'bg-primary-600 hover:bg-primary-700'
                  : 'bg-neutral-300 hover:bg-neutral-400 text-neutral-900'
              )}
            >
              {isSelected ? 'Voted!' : 'Vote'}
            </motion.button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

VoteCard.displayName = 'VoteCard';
