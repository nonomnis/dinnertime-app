'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  Button,
  LoadingSpinner,
  EmptyState,
  BreakfastPrepCard,
  Modal,
} from '@/components';
import { Plus, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BreakfastPrepItem {
  id: string;
  name: string;
  portionsRemaining: number;
  totalPortions: number;
  prepDate: string;
  expiryDate: string;
  lastPrepDate?: string;
  image?: string | null;
}

interface PrepSchedule {
  itemId: string;
  portions: number;
  proposedDate: string;
  notes?: string;
}

export default function BreakfastPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [prepItems, setPrepItems] = useState<BreakfastPrepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isParent, setIsParent] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [proposedDate, setProposedDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
  );

  const familyId = (session?.user as any)?.familyId;
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    setIsParent(userRole === 'ADMIN' || userRole === 'MEMBER');
  }, [userRole]);

  useEffect(() => {
    if (familyId) {
      fetchBreakfastItems();
    }
  }, [familyId]);

  const fetchBreakfastItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/breakfast?familyId=${familyId}`);
      if (response.ok) {
        const data = await response.json();
        setPrepItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching breakfast items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePrep = async () => {
    try {
      const itemsToSchedule = Array.from(selectedItems).map((itemId) => ({
        itemId,
        portions: 8,
        proposedDate,
      }));

      const response = await fetch('/api/breakfast/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          items: itemsToSchedule,
        }),
      });

      if (response.ok) {
        await fetchBreakfastItems();
        setSelectedItems(new Set());
        setShowScheduleModal(false);
      }
    } catch (error) {
      console.error('Error scheduling prep:', error);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const getLowInventoryItems = () =>
    prepItems.filter((item) => item.portionsRemaining <= 2);

  const getOutOfStockItems = () =>
    prepItems.filter((item) => item.portionsRemaining === 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const lowStock = getLowInventoryItems();
  const outOfStock = getOutOfStockItems();

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Breakfast Prep
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Inventory & Scheduling
          </p>
        </div>
        {isParent && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Add prep"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {/* Alerts */}
      {outOfStock.length > 0 && (
        <Card variant="flat" className="border-l-4 border-red-500 bg-red-50">
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900">
                {outOfStock.length} item{outOfStock.length > 1 ? 's' : ''} out of stock
              </h3>
              <p className="text-sm text-red-800 mt-1">
                {outOfStock.map((i) => i.name).join(', ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {lowStock.length > 0 && outOfStock.length === 0 && (
        <Card variant="flat" className="border-l-4 border-warm-500 bg-warm-50">
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-warm-700 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-warm-900">
                {lowStock.length} item{lowStock.length > 1 ? 's' : ''} low on inventory
              </h3>
              <p className="text-sm text-warm-800 mt-1">
                Consider scheduling more prep
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Inventory Grid */}
      {prepItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prepItems.map((item) => (
            <BreakfastPrepCard
              key={item.id}
              id={item.id}
              name={item.name}
              portionsRemaining={item.portionsRemaining}
              totalPortions={item.totalPortions}
              prepDate={new Date(item.prepDate)}
              expiryDate={new Date(item.expiryDate)}
              image={item.image}
              onSelect={
                isParent
                  ? () => toggleItemSelection(item.id)
                  : undefined
              }
              isSelected={selectedItems.has(item.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🍳"
          title="No Breakfast Prep"
          description="Start scheduling breakfast prep items for the week"
          action={
            isParent
              ? {
                  label: 'Schedule Prep',
                  onClick: () => setShowScheduleModal(true),
                }
              : undefined
          }
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <Modal
          title="Schedule Breakfast Prep"
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedItems(new Set());
          }}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-neutral-900 block mb-2">
                Select items to prep
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {prepItems.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-4 h-4 rounded border-neutral-300"
                    />
                    <span className="text-neutral-900">{item.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-900 block mb-2">
                Proposed Prep Date
              </label>
              <input
                type="date"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleSchedulePrep}
                fullWidth
                disabled={selectedItems.size === 0}
              >
                Schedule {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedItems(new Set());
                }}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
