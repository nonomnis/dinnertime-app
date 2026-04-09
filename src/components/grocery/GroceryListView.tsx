'use client';

import React from 'react';
import { GrocerySection } from './GrocerySection';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  section: string;
  isChecked?: boolean;
  sourceRecipes?: string[];
}

interface GroceryListViewProps {
  items: GroceryItem[];
  status?: 'DRAFT' | 'SHOPPING' | 'COMPLETED';
  onToggleItem?: (itemId: string, checked: boolean) => void;
  onGenerateList?: () => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export const GroceryListView: React.FC<GroceryListViewProps> = ({
  items,
  status = 'DRAFT',
  onToggleItem,
  onGenerateList,
  isLoading = false,
  className,
}) => {
  const checkedCount = items.filter((item) => item.isChecked).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
      acc[item.section].push(item);
      return acc;
    },
    {} as Record<string, GroceryItem[]>
  );

  const statusColors = {
    DRAFT: 'bg-neutral-100 text-neutral-800',
    SHOPPING: 'bg-accent-100 text-accent-800',
    COMPLETED: 'bg-secondary-100 text-secondary-800',
  };

  const statusLabels = {
    DRAFT: 'Draft',
    SHOPPING: 'Shopping',
    COMPLETED: 'Completed',
  };

  if (totalCount === 0) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <EmptyState
          icon="🛒"
          title="No grocery list"
          description="Plan your meals to generate a grocery list"
          action={{
            label: 'Generate List',
            onClick: onGenerateList || (() => {}),
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Card variant="flat">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900">Progress</h3>
            <Badge variant="primary" size="md">
              {statusLabels[status]}
            </Badge>
          </div>

          <ProgressBar
            percentage={progressPercentage}
            color="secondary"
            showLabel={true}
          />

          <p className="text-sm text-neutral-600">
            {checkedCount} of {totalCount} items checked
          </p>
        </div>
      </Card>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {Object.entries(groupedItems).map(([section, sectionItems]) => (
          <GrocerySection
            key={section}
            sectionName={section}
            items={sectionItems}
            onToggleItem={onToggleItem}
          />
        ))}
      </div>

      {checkedCount === totalCount && totalCount > 0 && (
        <Card variant="elevated" className="bg-secondary-50 border-secondary-200">
          <div className="text-center">
            <p className="text-lg font-bold text-secondary-900">
              Shopping complete!
            </p>
            <p className="text-sm text-secondary-700 mt-1">
              Great job getting everything!
            </p>
          </div>
        </Card>
      )}

      {onGenerateList && (
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          onClick={onGenerateList}
        >
          Regenerate List
        </Button>
      )}
    </div>
  );
};

GroceryListView.displayName = 'GroceryListView';
