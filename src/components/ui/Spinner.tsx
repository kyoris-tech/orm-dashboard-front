import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <div className={cn('flex justify-center items-center', className)}>
      <Loader2 className="animate-spin text-accent" size={size} />
    </div>
  );
}
