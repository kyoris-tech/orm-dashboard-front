import { forwardRef, memo } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function InputComponent({ label, className, ...props }: InputProps, ref: React.Ref<HTMLInputElement>) {
  return (
    <div className="flex flex-col w-full">
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
        <input
          {...props}
          ref={ref}
          placeholder={label}
          className={cn(
            'w-full h-[50px] pl-9 pr-4 py-2 rounded-full border border-border text-muted placeholder:text-muted',
            className,
          )}
        />
      </div>
    </div>
  );
}

export const Input = memo(forwardRef(InputComponent));
