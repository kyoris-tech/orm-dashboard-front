import { memo } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'accent';
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-white hover:brightness-110',
  accent: 'bg-accent text-white hover:bg-accent-dark',
};

const DISABLED_CLASSES = 'bg-border text-muted opacity-70';

function ButtonComponent({ loading, disabled, variant = 'primary', className, children, ...props }: ButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={cn('w-full py-3 rounded-full font-semibold transition', isDisabled ? DISABLED_CLASSES : VARIANT_CLASSES[variant], className)}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
}

export const Button = memo(ButtonComponent);
