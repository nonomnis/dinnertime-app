'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap', {
  variants: {
    variant: {
      breakfast: 'bg-yellow-100 text-yellow-800',
      lunch: 'bg-blue-100 text-blue-800',
      dinner: 'bg-purple-100 text-purple-800',
      snack: 'bg-orange-100 text-orange-800',
      primary: 'bg-primary-100 text-primary-800',
      secondary: 'bg-secondary-100 text-secondary-800',
      accent: 'bg-accent-100 text-accent-800',
      neutral: 'bg-neutral-200 text-neutral-800',
    },
    size: {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'sm',
  },
});

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  children,
  icon,
  ...props
}) => (
  <div
    className={cn(badgeVariants({ variant, size }), className)}
    {...props}
  >
    {icon}
    {children}
  </div>
);

Badge.displayName = 'Badge';
