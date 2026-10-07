import { forwardRef, memo } from 'react';
import { User, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { FieldError } from './FieldError';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

function InputComponent({ label, icon: Icon = User, error, className, ...props }: InputProps, ref: React.Ref<HTMLInputElement>) {
  return (
    <div className="flex flex-col w-full">
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
        <input
          {...props}
          ref={ref}
          placeholder={label}
          aria-invalid={error ? true : undefined}
          className={cn(
            'w-full h-[50px] pl-9 pr-4 py-2 rounded-full border border-border text-muted placeholder:text-muted',
            error && 'border-danger',
            className,
          )}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

export const Input = memo(forwardRef(InputComponent));
