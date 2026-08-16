import { memo } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function CardComponent({ children, className }: CardProps) {
  return <div className={cn('bg-surface p-8 rounded-2xl shadow-xl w-full max-w-md', className)}>{children}</div>;
}

export const Card = memo(CardComponent);
