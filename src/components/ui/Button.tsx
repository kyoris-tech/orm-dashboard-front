import { memo } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

function ButtonComponent({ loading, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={cn(
        'w-full py-3 rounded-full font-semibold text-white transition',
        loading ? 'bg-muted cursor-not-allowed' : 'bg-primary hover:brightness-110',
        className,
      )}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
}

export const Button = memo(ButtonComponent);
