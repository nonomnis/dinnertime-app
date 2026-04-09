'use client';

import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/Card';
import { MEAL_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryData {
  category: string;
  count: number;
}

interface CategoryChartProps {
  data: CategoryData[];
  className?: string;
}

const getCategoryColor = (category: string): string => {
  const categoryInfo = MEAL_CATEGORIES.find((c) => c.value === category);
  switch (category) {
    case 'BREAKFAST':
      return '#FCD34D';
    case 'LUNCH':
      return '#60A5FA';
    case 'DINNER':
      return '#A855F7';
    case 'SNACK':
      return '#FB923C';
    default:
      return '#D1D5DB';
  }
};

const getCategoryLabel = (category: string): string => {
  const categoryInfo = MEAL_CATEGORIES.find((c) => c.value === category);
  return categoryInfo?.label || category;
};

export const CategoryChart: React.FC<CategoryChartProps> = ({ data, className }) => {
  const chartData = data.map((item) => ({
    name: getCategoryLabel(item.category),
    value: item.count,
    category: item.category,
  }));

  const totalMeals = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={cn('flex flex-col gap-4', className)}>
      <div>
        <h3 className="text-lg font-bold text-neutral-900">
          Category Distribution
        </h3>
        <p className="text-sm text-neutral-600 mt-1">
          {totalMeals} total meals
        </p>
      </div>

      {totalMeals > 0 ? (
        <div className="w-full h-64 -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getCategoryColor(entry.category)}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
          <p className="text-neutral-500">No data available</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {chartData.map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getCategoryColor(item.category) }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-neutral-600">
                {item.value} meals
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

CategoryChart.displayName = 'CategoryChart';
