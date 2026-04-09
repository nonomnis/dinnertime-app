'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  LoadingSpinner,
  EmptyState,
  VoteSlot,
} from '@/components';
import { useRouter } from 'next/navigation';

interface Vote {
  id: string;
  scheduleEntryId: string;
  date: Date;
  status: string;
  foodOptions: Array<{
    id: string;
    name: string;
    category?: string;
    image?: string | null;
    voteCount?: number;
  }>;
  selectedVoteId?: string;
  closesAt?: Date;
}

export default function VotePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});

  const familyId = (session?.user as any)?.familyId;
  const userId = session?.user?.id;

  useEffect(() => {
    if (familyId) {
      fetchVotes();
    }
  }, [familyId]);

  const fetchVotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/votes?familyId=${familyId}`);
      if (response.ok) {
        const data = await response.json();
        const openVotes = data.filter((v: any) => v.status === 'OPEN');
        setVotes(openVotes);

        // Fetch user's existing votes
        const userVotesMap: Record<string, string> = {};
        for (const vote of openVotes) {
          try {
            const res = await fetch(
              `/api/votes/${vote.scheduleEntryId}/tally?userId=${userId}`
            );
            if (res.ok) {
              const tally = await res.json();
              if (tally.userVoteId) {
                userVotesMap[vote.scheduleEntryId] = tally.userVoteId;
              }
            }
          } catch (error) {
            console.error('Error fetching user vote:', error);
          }
        }
        setUserVotes(userVotesMap);
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (entryId: string, foodOptionId: string) => {
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleEntryId: entryId,
          foodOptionId,
          familyId,
          userId,
        }),
      });

      if (response.ok) {
        setUserVotes({
          ...userVotes,
          [entryId]: foodOptionId,
        });
        await fetchVotes();
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (votes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Vote</h1>
        <EmptyState
          icon="🗳️"
          title="All Meals Locked In"
          description="There are no open voting slots right now. Check back later!"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Vote for Upcoming Meals
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Help decide what your family eats
        </p>
      </div>

      <div className="space-y-6">
        {votes.map((vote) => (
          <VoteSlot
            key={vote.scheduleEntryId}
            scheduleEntryId={vote.scheduleEntryId}
            date={new Date(vote.date)}
            foodOptions={vote.foodOptions}
            selectedVoteId={userVotes[vote.scheduleEntryId]}
            onVote={(foodOptionId) =>
              handleVote(vote.scheduleEntryId, foodOptionId)
            }
            closesAt={vote.closesAt ? new Date(vote.closesAt) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
