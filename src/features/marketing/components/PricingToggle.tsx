'use client';

import { cn } from '@/lib/utils/cn';

export type BillingCycle = 'annual' | 'monthly';

export interface PricingToggleProps {
  value: BillingCycle;
  onChange: (value: BillingCycle) => void;
}

export function PricingToggle({ value, onChange }: PricingToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
      <button
        type="button"
        onClick={() => onChange('annual')}
        className={cn(
          'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
          value === 'annual' ? 'bg-white text-[#05070c]' : 'text-white/70 hover:text-white',
        )}
      >
        Anual
        <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">20% off</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('monthly')}
        className={cn(
          'rounded-full px-4 py-2 text-sm font-medium transition',
          value === 'monthly' ? 'bg-white text-[#05070c]' : 'text-white/70 hover:text-white',
        )}
      >
        Mensal
      </button>
    </div>
  );
}
