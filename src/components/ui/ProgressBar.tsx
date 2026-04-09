'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

const colorMap = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  accent: 'bg-accent-500',
  success: 'bg-green-500',
  warning: 'bg-warm-500',
  danger: 'bg-red-500',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  height = 8,
  color = 'primary',
  animated = true,
  showLabel = false,
  className,
}) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div
        className="relative w-full bg-neutral-200 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <motion.div
          className={cn('h-full rounded-full', colorMap[color])}
          initial={{ width: 0 }}
          animate={{ width: `${clampedPercentage}%` }}
          transition={
            animated
              ? { type: 'spring', damping: 20, stiffness: 100 }
              : { duration: 0 }
          }
        />
      </div>
      {showLabel && (
        <p className="mt-2 text-sm font-medium text-neutral-600">
          {clampedPercentage.toFixed(0)}%
        </p>
      )}
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';
