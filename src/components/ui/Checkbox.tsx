import { forwardRef, memo } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

function CheckboxComponent({ className, ...props }: CheckboxProps, ref: React.Ref<HTMLInputElement>) {
  return (
    <label className={cn('relative inline-flex items-center justify-center w-5 h-5 cursor-pointer shrink-0', className)}>
      <input type="checkbox" ref={ref} className="peer sr-only" {...props} />
      <span className="w-5 h-5 rounded-md border border-border bg-surface peer-checked:bg-accent peer-checked:border-accent transition-colors" />
      <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
    </label>
  );
}

export const Checkbox = memo(forwardRef(CheckboxComponent));
