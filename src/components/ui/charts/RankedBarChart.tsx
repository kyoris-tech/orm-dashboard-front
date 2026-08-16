'use client';

import { memo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface RankedBarChartItem {
  label: string;
  count: number;
}

export interface RankedBarChartProps {
  items: RankedBarChartItem[];
  emptyMessage?: string;
}

interface RankedBarTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: RankedBarChartItem }>;
}

function RankedBarTooltip({ active, payload }: RankedBarTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="text-foreground font-semibold">{item.label}</p>
      <p className="text-muted">{item.count}</p>
    </div>
  );
}

const MIN_CHART_HEIGHT = 120;
const ROW_HEIGHT = 36;

function RankedBarChartComponent({ items, emptyMessage = 'Sem dados suficientes.' }: RankedBarChartProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">{emptyMessage}</p>;
  }

  const chartHeight = Math.max(items.length * ROW_HEIGHT, MIN_CHART_HEIGHT);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={items} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barCategoryGap={8}>
        <CartesianGrid horizontal={false} stroke="var(--color-border)" strokeOpacity={0.6} />
        <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fill: 'var(--color-foreground)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={140}
        />
        <Tooltip content={<RankedBarTooltip />} cursor={{ fill: 'var(--color-surface-soft)' }} />
        <Bar dataKey="count" fill="var(--color-accent)" radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export const RankedBarChart = memo(RankedBarChartComponent);
