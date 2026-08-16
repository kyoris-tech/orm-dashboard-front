import { forwardRef, memo, useCallback } from 'react';
import { Building2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatCnpj } from '@/lib/utils/cnpj';

export interface CnpjInputProps {
  label: string;
  icon?: LucideIcon;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  required?: boolean;
  autoFocus?: boolean;
}

function CnpjInputComponent(
  { label, icon: Icon = Building2, value, onValueChange, className, required, autoFocus }: CnpjInputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange(formatCnpj(event.target.value));
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
          value={value}
          onChange={handleChange}
          required={required}
          autoFocus={autoFocus}
          maxLength={18}
          className={cn(
            'w-full h-[50px] pl-9 pr-4 py-2 rounded-full border border-border text-muted placeholder:text-muted',
            className,
          )}
        />
      </div>
    </div>
  );
}

export const CnpjInput = memo(forwardRef(CnpjInputComponent));
