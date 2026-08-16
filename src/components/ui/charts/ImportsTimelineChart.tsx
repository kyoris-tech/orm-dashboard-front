'use client';

import { memo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface TimelinePoint {
  label: string;
  count: number;
}

export interface ImportsTimelineChartProps {
  points: TimelinePoint[];
}

interface TimelineTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function TimelineTooltip({ active, payload, label }: TimelineTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="text-muted mb-1">{label}</p>
      <p className="text-foreground font-semibold">{payload[0].value} importações</p>
    </div>
  );
}

function ImportsTimelineChartComponent({ points }: ImportsTimelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="importsAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.6} />
        <XAxis dataKey="label" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
        <Tooltip content={<TimelineTooltip />} cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }} />
        <Area type="monotone" dataKey="count" stroke="var(--color-accent)" strokeWidth={2} fill="url(#importsAreaFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export const ImportsTimelineChart = memo(ImportsTimelineChartComponent);
