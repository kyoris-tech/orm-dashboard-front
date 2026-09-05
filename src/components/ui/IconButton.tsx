import { memo } from 'react';
import { cn } from '@/lib/utils/cn';

export type IconButtonTone = 'accent' | 'danger';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: IconButtonTone;
}

const TONE_CLASSES: Record<IconButtonTone, string> = {
  accent: 'hover:text-accent',
  danger: 'hover:text-danger',
};

function IconButtonComponent({ tone = 'accent', className, type = 'button', children, ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        'text-muted transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </button>
  );
}

export const IconButton = memo(IconButtonComponent);
