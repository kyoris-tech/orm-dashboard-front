import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  className?: string;
}

function StatCardComponent({ label, value, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn('bg-surface border border-border rounded-2xl p-6 flex items-center gap-4', className)}>
      <div className="bg-surface-soft text-accent rounded-full p-3">
        <Icon size={24} />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold text-primary">{value}</span>
        <span className="text-sm text-muted">{label}</span>
      </div>
    </div>
  );
}

export const StatCard = memo(StatCardComponent);
