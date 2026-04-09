'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppShell, LoadingSpinner, EmptyState } from '@/components';
import { signOut } from 'next-auth/react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [familyData, setFamilyData] = useState<any>(null);
  const [votingCount, setVotingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasFamily, setHasFamily] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      fetchFamilyData();
      fetchVotingCount();
    }
  }, [status, session, router]);

  const fetchFamilyData = async () => {
    try {
      const familyId = (session?.user as any)?.familyId;

      if (!familyId) {
        setHasFamily(false);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/families/${familyId}`);
      if (response.ok) {
        const data = await response.json();
        setFamilyData(data);
        setHasFamily(true);
      } else {
        setHasFamily(false);
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
      setHasFamily(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchVotingCount = async () => {
    try {
      const familyId = (session?.user as any)?.familyId;
      if (!familyId) return;

      const response = await fetch(`/api/votes?familyId=${familyId}`);
      if (response.ok) {
        const data = await response.json();
        const openVotes = data.filter((vote: any) => vote.status === 'OPEN');
        setVotingCount(openVotes.length);
      }
    } catch (error) {
      console.error('Error fetching voting count:', error);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!hasFamily) {
    return (
      <div className="min-h-screen-mobile bg-neutral-50 flex items-center justify-center p-4">
        <EmptyState
          icon="👨‍👩‍👧‍👦"
          title="No Family Yet"
          description="You need to be part of a family to use DinnerTime. Create or join a family to get started."
          action={{
            label: 'Go to Settings',
            onClick: () => router.push('/settings'),
          }}
        />
      </div>
    );
  }

  return (
    <AppShell
      familyName={familyData?.name || 'Family'}
      userImage={session?.user?.image}
      userName={session?.user?.name || 'User'}
      onLogout={handleLogout}
      votingCount={votingCount}
    >
      {children}
    </AppShell>
  );
}
