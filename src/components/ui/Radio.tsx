import { forwardRef, memo } from 'react';
import { cn } from '@/lib/utils/cn';

export type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

function RadioComponent({ className, ...props }: RadioProps, ref: React.Ref<HTMLInputElement>) {
  return (
    <label className={cn('relative inline-flex items-center justify-center w-5 h-5 cursor-pointer shrink-0', className)}>
      <input type="radio" ref={ref} className="peer sr-only" {...props} />
      <span className="w-5 h-5 rounded-full border border-border bg-surface peer-checked:border-accent transition-colors" />
      <span className="absolute w-2.5 h-2.5 rounded-full bg-accent opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
    </label>
  );
}

export const Radio = memo(forwardRef(RadioComponent));
