import { forwardRef, memo, useCallback } from 'react';
import { Wallet, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { FieldError } from './FieldError';
import { centsToReais, formatCurrency } from '@/lib/utils/currency';

export interface CurrencyInputProps {
  label: string;
  icon?: LucideIcon;
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
  className?: string;
  required?: boolean;
  autoFocus?: boolean;
  error?: string;
  onBlur?: () => void;
}

function CurrencyInputComponent(
  { label, icon: Icon = Wallet, value, onValueChange, className, required, autoFocus, error, onBlur }: CurrencyInputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const displayValue = value === undefined ? '' : formatCurrency(value);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/\D/g, '');

      if (digits === '') {
        onValueChange(undefined);
        return;
      }

      onValueChange(centsToReais(digits));
    },
    [onValueChange],
  );

  return (
    <div className="flex flex-col w-full">
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          placeholder={label}
          value={displayValue}
          onChange={handleChange}
          required={required}
          autoFocus={autoFocus}
          onBlur={onBlur}
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

export const CurrencyInput = memo(forwardRef(CurrencyInputComponent));
