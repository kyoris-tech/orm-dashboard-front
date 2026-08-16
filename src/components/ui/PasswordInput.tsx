import { forwardRef, memo } from 'react';
import { SquareAsterisk } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function PasswordInputComponent(
  { label, className, ...props }: PasswordInputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  return (
    <div className="w-full">
      <div className="relative">
        <SquareAsterisk className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
        <input
          {...props}
          ref={ref}
          type="password"
          placeholder={label}
          inputMode="text"
          autoComplete="current-password"
          className={cn(
            'w-full h-[50px] pl-9 pr-4 py-2 text-base leading-5 rounded-full border border-border text-muted placeholder:text-muted appearance-none bg-surface',
            className,
          )}
        />
      </div>
    </div>
  );
}

export const PasswordInput = memo(forwardRef(PasswordInputComponent));
