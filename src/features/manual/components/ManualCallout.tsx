import { cn } from '@/lib/utils/cn';

export type ManualCalloutTone = 'tip' | 'warning';

export interface ManualCalloutProps {
  tone?: ManualCalloutTone;
  title: string;
  children: React.ReactNode;
}

const TONE_CLASSES: Record<ManualCalloutTone, string> = {
  tip: 'bg-success-soft border-success',
  warning: 'bg-danger-soft border-danger',
};

const TITLE_CLASSES: Record<ManualCalloutTone, string> = {
  tip: 'text-success',
  warning: 'text-danger',
};

export function ManualCallout({ tone = 'tip', title, children }: ManualCalloutProps) {
  return (
    <div className={cn('mb-6 rounded-xl border-l-[3px] px-5 py-4', TONE_CLASSES[tone])}>
      <p className={cn('mb-1 font-semibold', TITLE_CLASSES[tone])}>{title}</p>
      <div className="flex flex-col gap-2 text-foreground">{children}</div>
    </div>
  );
}
