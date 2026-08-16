import { memo } from 'react';
import { cn } from '@/lib/utils/cn';

type BadgeTone = 'neutral' | 'success' | 'danger' | 'accent';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneClassMap: Record<BadgeTone, string> = {
  neutral: 'bg-surface-soft text-muted',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  accent: 'bg-surface-soft text-accent',
};

function BadgeComponent({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium', toneClassMap[tone], className)}>
      {children}
    </span>
  );
}

export const Badge = memo(BadgeComponent);
