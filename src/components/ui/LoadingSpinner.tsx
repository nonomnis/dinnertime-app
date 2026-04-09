'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('rounded-full border-4 border-neutral-200 animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4 border-primary-500',
      md: 'h-8 w-8 border-primary-500',
      lg: 'h-12 w-12 border-primary-500',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const spinnerInnerVariants = cva('absolute rounded-full border-4 border-transparent', {
  variants: {
    size: {
      sm: 'h-4 w-4 border-t-primary-500',
      md: 'h-8 w-8 border-t-primary-500',
      lg: 'h-12 w-12 border-t-primary-500',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  fullPage?: boolean;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  fullPage = false,
  label = 'Loading...',
}) => {
  const spinner = (
    <div className="relative flex items-center justify-center">
      <div className={cn(spinnerVariants({ size }), className)} />
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          {label && <p className="text-neutral-600 text-sm">{label}</p>}
        </div>
      </div>
    );
  }

  return spinner;
};
