'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  Button,
  LoadingSpinner,
  EmptyState,
  GroceryListView,
  ProgressBar,
} from '@/components';
import { format, startOfWeek, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  completed: boolean;
}

interface GroceryList {
  id: string;
  week: string;
  items: GroceryItem[];
  status: 'PENDING' | 'APPROVED' | 'SHOPPING' | 'COMPLETE';
  createdAt: string;
}

export default function GroceryPage() {
  const { data: session } = useSession();
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [currentList, setCurrentList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekDate, setWeekDate] = useState(startOfWeek(new Date()));
  const [isParent, setIsParent] = useState(false);

  const familyId = (session?.user as any)?.familyId;
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    setIsParent(userRole === 'ADMIN' || userRole === 'MEMBER');
  }, [userRole]);

  useEffect(() => {
    if (familyId) {
      fetchGroceryLists();
    }
  }, [familyId]);

  useEffect(() => {
    if (lists.length > 0) {
      const weekString = format(weekDate, 'yyyy-W');
      const list = lists.find((l) => l.week === weekString);
      setCurrentList(list || null);
    }
  }, [lists, weekDate]);

  const fetchGroceryLists = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/grocery?familyId=${familyId}`);
      if (response.ok) {
        const data = await response.json();
        setLists(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          setCurrentList(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching grocery lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateList = async () => {
    try {
      const response = await fetch('/api/grocery/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          week: format(weekDate, 'yyyy-W'),
        }),
      });

      if (response.ok) {
        await fetchGroceryLists();
      }
    } catch (error) {
      console.error('Error generating list:', error);
    }
  };

  const handleUpdateListStatus = async (listId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/grocery/${listId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchGroceryLists();
      }
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/grocery/${currentList?.id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        await fetchGroceryLists();
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const completedItems = currentList?.items.filter((i) => i.completed).length || 0;
  const totalItems = currentList?.items.length || 0;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Grocery List</h1>
        <p className="text-sm text-neutral-600 mt-1">
          {format(weekDate, 'MMM d')} - {format(addDays(weekDate, 6), 'MMM d')}
        </p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setWeekDate(addDays(weekDate, -7))}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="font-semibold text-neutral-900">
          {format(weekDate, 'MMMM d')} - {format(addDays(weekDate, 6), 'd')}
        </span>
        <button
          onClick={() => setWeekDate(addDays(weekDate, 7))}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Progress */}
      {currentList && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-neutral-900">Progress</span>
            <span className="text-neutral-600">
              {completedItems} / {totalItems}
            </span>
          </div>
          <ProgressBar value={progressPercent} />
        </div>
      )}

      {/* Status Actions */}
      {currentList && isParent && (
        <div className="flex gap-2">
          {currentList.status === 'PENDING' && (
            <Button
              variant="primary"
              onClick={() => handleUpdateListStatus(currentList.id, 'APPROVED')}
              fullWidth
            >
              Approve
            </Button>
          )}
          {currentList.status === 'APPROVED' && (
            <Button
              variant="secondary"
              onClick={() => handleUpdateListStatus(currentList.id, 'SHOPPING')}
              fullWidth
            >
              Start Shopping
            </Button>
          )}
          {currentList.status === 'SHOPPING' && (
            <Button
              variant="secondary"
              onClick={() => handleUpdateListStatus(currentList.id, 'COMPLETE')}
              fullWidth
            >
              Mark Complete
            </Button>
          )}
        </div>
      )}

      {/* List Content */}
      {currentList ? (
        <GroceryListView
          items={currentList.items}
          onToggleItem={handleToggleItem}
          status={currentList.status}
        />
      ) : (
        <div className="space-y-4">
          <EmptyState
            icon="🛒"
            title="No Grocery List"
            description="Generate a list based on this week's meals"
            action={
              isParent
                ? {
                    label: 'Generate List',
                    onClick: handleGenerateList,
                  }
                : undefined
            }
          />
        </div>
      )}

      {/* Generate Button */}
      {!currentList && isParent && (
        <Button
          variant="primary"
          onClick={handleGenerateList}
          fullWidth
        >
          Generate List
        </Button>
      )}
    </div>
  );
}
