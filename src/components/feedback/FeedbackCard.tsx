'use client';

import React from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FeedbackCardProps {
  mealId: string;
  mealName: string;
  mealImage?: string | null;
  onSubmit: (data: {
    mealId: string;
    rating: number;
    feedback: 'DOWN' | 'OKAY' | 'UP';
    comment?: string;
  }) => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  mealId,
  mealName,
  mealImage,
  onSubmit,
  isLoading = false,
  className,
}) => {
  const [rating, setRating] = React.useState(3);
  const [selectedFeedback, setSelectedFeedback] = React.useState<
    'DOWN' | 'OKAY' | 'UP' | null
  >(null);
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!selectedFeedback) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        mealId,
        rating,
        feedback: selectedFeedback,
        comment: comment || undefined,
      });
    } finally {
      setIsSubmitting(false);
      setRating(3);
      setSelectedFeedback(null);
      setComment('');
    }
  };

  const isValid = selectedFeedback !== null;

  return (
    <Card variant="elevated" className={cn('flex flex-col gap-4', className)}>
      <div className="flex gap-4 items-start">
        {mealImage && (
          <img
            src={mealImage}
            alt={mealName}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-neutral-900 line-clamp-2">
            {mealName}
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            How was your meal?
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-neutral-900">
          Rate this meal
        </label>
        <StarRating
          value={rating}
          onChange={setRating}
          readOnly={false}
          size="lg"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-neutral-900">
          Your feedback
        </label>
        <div className="grid grid-cols-3 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedFeedback('DOWN')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-lg transition-all min-h-[80px]',
              'border-2 active:scale-95',
              selectedFeedback === 'DOWN'
                ? 'border-red-500 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300'
            )}
          >
            <ThumbsDown
              size={24}
              className={cn(
                'transition-colors',
                selectedFeedback === 'DOWN' ? 'text-red-600' : 'text-neutral-500'
              )}
            />
            <span className="text-xs font-semibold text-neutral-900">
              Not Great
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedFeedback('OKAY')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-lg transition-all min-h-[80px]',
              'border-2 active:scale-95',
              selectedFeedback === 'OKAY'
                ? 'border-warm-500 bg-warm-50'
                : 'border-neutral-200 hover:border-neutral-300'
            )}
          >
            <span className="text-2xl">😐</span>
            <span className="text-xs font-semibold text-neutral-900">
              Okay
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedFeedback('UP')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-lg transition-all min-h-[80px]',
              'border-2 active:scale-95',
              selectedFeedback === 'UP'
                ? 'border-secondary-500 bg-secondary-50'
                : 'border-neutral-200 hover:border-neutral-300'
            )}
          >
            <ThumbsUp
              size={24}
              className={cn(
                'transition-colors',
                selectedFeedback === 'UP' ? 'text-secondary-600' : 'text-neutral-500'
              )}
            />
            <span className="text-xs font-semibold text-neutral-900">
              Encore!
            </span>
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-neutral-900">
          Comments (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think about the meal?"
          maxLength={200}
          rows={3}
          className={cn(
            'px-4 py-3 rounded-lg border border-neutral-300',
            'bg-white text-neutral-900 placeholder-neutral-500 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'resize-none'
          )}
        />
        <p className="text-xs text-neutral-500">
          {comment.length}/200
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
        isLoading={isSubmitting || isLoading}
      >
        Submit Feedback
      </Button>
    </Card>
  );
};

FeedbackCard.displayName = 'FeedbackCard';
