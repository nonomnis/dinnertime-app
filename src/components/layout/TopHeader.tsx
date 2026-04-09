'use client';

import React from 'react';
import { ChevronLeft, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

interface TopHeaderProps {
  familyName?: string;
  userImage?: string | null;
  userName?: string;
  showBackButton?: boolean;
  onLogout?: () => void | Promise<void>;
  className?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  familyName = 'Family',
  userImage,
  userName,
  showBackButton = false,
  onLogout,
  className,
}) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onLogout) {
        await onLogout();
      }
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-white border-b border-neutral-200 safe-top',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 h-16">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Go back"
            >
              <ChevronLeft size={24} className="text-neutral-600" />
            </button>
          )}
          <h1 className="text-xl font-bold text-neutral-900">{familyName}</h1>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              'p-2 hover:bg-neutral-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center'
            )}
            aria-label="User menu"
          >
            <Avatar
              src={userImage}
              alt={userName || 'User'}
              initials={getInitials(userName)}
              size="md"
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-neutral-200 shadow-lg py-2 z-50">
              {userName && (
                <div className="px-4 py-2 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-900">
                    {userName}
                  </p>
                </div>
              )}
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings size={18} />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <LogOut size={18} />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

TopHeader.displayName = 'TopHeader';
