import { cn } from '@/lib/utils/cn';

export interface DetailFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

export function DetailField({ label, children, className, valueClassName }: DetailFieldProps) {
  return (
    <div className={className}>
      <p className="text-muted">{label}</p>
      <p className={cn('text-foreground font-medium', valueClassName)}>{children}</p>
    </div>
  );
}
