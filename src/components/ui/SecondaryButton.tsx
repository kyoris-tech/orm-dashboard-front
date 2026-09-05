import { memo } from 'react';
import { cn } from '@/lib/utils/cn';

export type SecondaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function SecondaryButtonComponent({ className, type = 'button', children, ...props }: SecondaryButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        'px-6 py-2 rounded-full border border-border text-muted hover:bg-surface-soft transition font-medium disabled:opacity-60 disabled:cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  );
}

export const SecondaryButton = memo(SecondaryButtonComponent);
