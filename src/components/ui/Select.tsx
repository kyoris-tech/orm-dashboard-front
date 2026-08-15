import { forwardRef, memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  placeholder?: string;
}

function SelectComponent({ options, placeholder, className, ...props }: SelectProps, ref: React.Ref<HTMLSelectElement>) {
  return (
    <div className="relative w-full">
      <select
        {...props}
        ref={ref}
        className={cn(
          'w-full h-[50px] px-4 pr-10 rounded-full border border-border text-foreground bg-surface appearance-none disabled:opacity-60',
          className,
        )}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
    </div>
  );
}

export const Select = memo(forwardRef(SelectComponent));
