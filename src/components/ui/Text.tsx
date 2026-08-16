import { memo } from 'react';
import { cn } from '@/lib/utils/cn';

type TextVariant = 'title' | 'subtitle' | 'body' | 'caption';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof React.JSX.IntrinsicElements;
  variant?: TextVariant;
  muted?: boolean;
}

const variantClassMap: Record<TextVariant, string> = {
  title: 'text-2xl font-semibold text-primary',
  subtitle: 'text-lg font-medium text-primary',
  body: 'text-sm text-foreground',
  caption: 'text-xs text-muted',
};

function TextComponent({ as: Tag = 'p', variant = 'body', muted, className, ...props }: TextProps) {
  const Element = Tag as React.ElementType;

  return <Element className={cn(variantClassMap[variant], muted && 'text-muted', className)} {...props} />;
}

export const Text = memo(TextComponent);
