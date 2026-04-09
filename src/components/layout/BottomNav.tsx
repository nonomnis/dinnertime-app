'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Calendar,
  ThumbsUp,
  ShoppingCart,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface BottomNavProps {
  className?: string;
  votingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  className,
  votingCount = 0,
}) => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/home',
      label: 'Home',
      icon: <Home size={24} />,
    },
    {
      href: '/schedule',
      label: 'Schedule',
      icon: <Calendar size={24} />,
    },
    {
      href: '/vote',
      label: 'Vote',
      icon: <ThumbsUp size={24} />,
      badge: votingCount > 0 ? votingCount : undefined,
    },
    {
      href: '/grocery',
      label: 'Grocery',
      icon: <ShoppingCart size={24} />,
    },
    {
      href: '/settings',
      label: 'More',
      icon: <Menu size={24} />,
    },
  ];

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 safe-bottom',
        className
      )}
    >
      <div className="flex justify-around items-center h-20 px-4 pb-safe-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] relative',
                isActive
                  ? 'text-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

BottomNav.displayName = 'BottomNav';
