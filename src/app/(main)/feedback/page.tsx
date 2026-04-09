'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  LoadingSpinner,
  EmptyState,
  FeedbackCard,
  Badge,
} from '@/components';
import { Star } from 'lucide-react';

interface PendingMeal {
  id: string;
  name: string;
  image?: string | null;
  scheduledDate: string;
  category: string;
}

interface FeedbackHistory {
  id: string;
  mealName: string;
  rating: number;
  feedback: 'DOWN' | 'OKAY' | 'UP';
  comment?: string;
  createdAt: string;
}

export default function FeedbackPage() {
  const { data: session } = useSession();
  const [pendingMeals, setPendingMeals] = useState<PendingMeal[]>([]);
  const [history, setHistory] = useState<FeedbackHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [monthStats, setMonthStats] = useState(0);

  const familyId = (session?.user as any)?.familyId;
  const userId = session?.user?.id;

  useEffect(() => {
    if (familyId) {
      fetchPendingMeals();
      fetchFeedbackHistory();
      fetchMonthStats();
    }
  }, [familyId]);

  const fetchPendingMeals = async () => {
    try {
      const response = await fetch(`/api/feedback?familyId=${familyId}`);
      if (response.ok) {
        const data = await response.json();
        const pending = data.filter(
          (f: any) =>
            !f.ratingSubmitted &&
            new Date(f.scheduledDate) >
              new Date(Date.now() - 48 * 60 * 60 * 1000)
        );
        setPendingMeals(pending);
      }
    } catch (error) {
      console.error('Error fetching pending meals:', error);
    }
  };

  const fetchFeedbackHistory = async () => {
    try {
      const response = await fetch(
        `/api/feedback?familyId=${familyId}&userId=${userId}&submitted=true`
      );
      if (response.ok) {
        const data = await response.json();
        setHistory(data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching feedback history:', error);
    }
  };

  const fetchMonthStats = async () => {
    try {
      const response = await fetch(
        `/api/feedback?familyId=${familyId}&userId=${userId}&timeRange=30`
      );
      if (response.ok) {
        const data = await response.json();
        setMonthStats(data.filter((f: any) => f.ratingSubmitted).length);
      }
    } catch (error) {
      console.error('Error fetching month stats:', error);
    }
  };

  const handleFeedbackSubmit = async (feedbackData: any) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedbackData,
          familyId,
          userId,
        }),
      });
      await fetchPendingMeals();
      await fetchFeedbackHistory();
      await fetchMonthStats();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getFeedbackEmoji = (feedback: string) => {
    switch (feedback) {
      case 'DOWN':
        return '👎';
      case 'OKAY':
        return '😐';
      case 'UP':
        return '👍';
      default:
        return '🤔';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Feedback</h1>
        <Card variant="flat" className="py-2 px-4">
          <p className="text-sm">
            <span className="font-bold text-primary-600">{monthStats}</span>
            <span className="text-neutral-600 ml-1">rated this month</span>
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'pending'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600'
          }`}
        >
          Pending ({pendingMeals.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'history'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-600'
          }`}
        >
          History
        </button>
      </div>

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingMeals.length === 0 ? (
            <EmptyState
              icon="✅"
              title="All Caught Up!"
              description="You've rated all recent meals. Keep an eye out for more."
            />
          ) : (
            pendingMeals.map((meal) => (
              <FeedbackCard
                key={meal.id}
                mealId={meal.id}
                mealName={meal.name}
                mealImage={meal.image}
                onSubmit={handleFeedbackSubmit}
              />
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No Feedback Yet"
              description="Your feedback history will appear here"
            />
          ) : (
            history.map((item) => (
              <Card key={item.id} variant="flat">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-900">
                      {item.mealName}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < item.rating
                                ? 'fill-warm-400 text-warm-400'
                                : 'text-neutral-300'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm text-neutral-600">
                        {item.rating}/5
                      </span>
                    </div>
                    {item.comment && (
                      <p className="text-sm text-neutral-600 mt-2 italic">
                        "{item.comment}"
                      </p>
                    )}
                  </div>
                  <div className="text-3xl flex-shrink-0">
                    {getFeedbackEmoji(item.feedback)}
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-3">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
