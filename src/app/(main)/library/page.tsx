'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  Button,
  LoadingSpinner,
  EmptyState,
  FoodGrid,
  Modal,
  AddFoodForm,
} from '@/components';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FoodOption {
  id: string;
  name: string;
  category: string;
  prepTime?: number;
  image?: string | null;
  rating?: number;
  timesServed?: number;
}

const CATEGORIES = [
  { value: 'ALL', label: 'All' },
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'SNACK', label: 'Snack' },
];

export default function LibraryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [foods, setFoods] = useState<FoodOption[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<FoodOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isParent, setIsParent] = useState(false);

  const familyId = (session?.user as any)?.familyId;
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    setIsParent(userRole === 'ADMIN' || userRole === 'MEMBER');
  }, [userRole]);

  useEffect(() => {
    if (familyId) {
      fetchFoods();
    }
  }, [familyId]);

  useEffect(() => {
    filterFoods();
  }, [foods, selectedCategory, searchTerm]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/foods?familyId=${familyId}`);
      if (response.ok) {
        const data = await response.json();
        setFoods(data || []);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFoods = () => {
    let filtered = foods;

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter((f) => f.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter((f) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFoods(filtered);
  };

  const handleAddFood = async (foodData: any) => {
    try {
      const response = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...foodData,
          familyId,
        }),
      });

      if (response.ok) {
        await fetchFoods();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding food:', error);
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
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Food Library</h1>
          <p className="text-sm text-neutral-600 mt-1">
            {filteredFoods.length} meals available
          </p>
        </div>
        {isParent && (
          <button
            onClick={() => setShowAddForm(true)}
            className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Add meal"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search meals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition-colors text-sm ${
              selectedCategory === cat.value
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Food Grid */}
      {filteredFoods.length > 0 ? (
        <FoodGrid
          foods={filteredFoods.map((f) => ({
            id: f.id,
            name: f.name,
            category: f.category,
            prepTime: f.prepTime,
            image: f.image,
            rating: f.rating,
            timesServed: f.timesServed,
            onClick: () => {
              // Could open a detail view or add to schedule
            },
          }))}
          variant="compact"
        />
      ) : (
        <EmptyState
          icon="🍽️"
          title={searchTerm ? 'No meals found' : 'No meals yet'}
          description={
            searchTerm
              ? 'Try a different search term'
              : 'Add meals to your family library'
          }
          action={
            isParent
              ? {
                  label: 'Add Meal',
                  onClick: () => setShowAddForm(true),
                }
              : undefined
          }
        />
      )}

      {/* Add Food Modal */}
      {showAddForm && (
        <Modal
          title="Add New Meal"
          onClose={() => setShowAddForm(false)}
          size="lg"
        >
          <AddFoodForm
            onSubmit={handleAddFood}
            onCancel={() => setShowAddForm(false)}
          />
        </Modal>
      )}
    </div>
  );
}
