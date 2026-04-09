'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface TrendData {
  period: string;
  rating: number;
}

interface RatingTrendChartProps {
  data: TrendData[];
  className?: string;
}

export const RatingTrendChart: React.FC<RatingTrendChartProps> = ({
  data,
  className,
}) => {
  const averageRating =
    data.length > 0
      ? (
          data.reduce((sum, item) => sum + item.rating, 0) / data.length
        ).toFixed(2)
      : '0';

  return (
    <Card className={cn('flex flex-col gap-4', className)}>
      <div>
        <h3 className="text-lg font-bold text-neutral-900">
          Rating Trend
        </h3>
        <p className="text-sm text-neutral-600 mt-1">
          Average rating: <span className="font-semibold">{averageRating}</span> out of 5
        </p>
      </div>

      {data.length > 0 ? (
        <div className="w-full h-64 -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="period"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                domain={[0, 5]}
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow:
                    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value) => [
                  typeof value === 'number' ? value.toFixed(2) : value,
                  'Rating',
                ]}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#F44336"
                strokeWidth={3}
                dot={{ fill: '#F44336', r: 5 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
          <p className="text-neutral-500">No data available</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
        <div>
          <p className="text-xs text-neutral-600 font-medium">Highest</p>
          <p className="text-lg font-bold text-neutral-900">
            {data.length > 0
              ? Math.max(...data.map((d) => d.rating)).toFixed(1)
              : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 font-medium">Lowest</p>
          <p className="text-lg font-bold text-neutral-900">
            {data.length > 0
              ? Math.min(...data.map((d) => d.rating)).toFixed(1)
              : '-'}
          </p>
        </div>
      </div>
    </Card>
  );
};

RatingTrendChart.displayName = 'RatingTrendChart';
