'use client';

import React from 'react';
import { TopHeader } from './TopHeader';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  familyName?: string;
  userImage?: string | null;
  userName?: string;
  showBackButton?: boolean;
  onLogout?: () => void | Promise<void>;
  votingCount?: number;
  className?: string;
  mainClassName?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  familyName,
  userImage,
  userName,
  showBackButton = false,
  onLogout,
  votingCount = 0,
  className,
  mainClassName,
}) => {
  return (
    <div className={cn('flex flex-col h-screen-mobile bg-neutral-50', className)}>
      <TopHeader
        familyName={familyName}
        userImage={userImage}
        userName={userName}
        showBackButton={showBackButton}
        onLogout={onLogout}
      />

      <main
        className={cn(
          'flex-1 overflow-y-auto pb-24 pt-4 px-4',
          'safe-bottom',
          mainClassName
        )}
      >
        {children}
      </main>

      <BottomNav votingCount={votingCount} />
    </div>
  );
};

AppShell.displayName = 'AppShell';
