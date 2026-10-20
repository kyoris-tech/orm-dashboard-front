'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { PlanCard, type PlanBilling } from './PlanCard';
import { ANNUAL_BILLED_MONTHS, PLAN_COPY } from '../content';

const FREE_MONTHS = 12 - ANNUAL_BILLED_MONTHS;

const BILLING_OPTIONS: ReadonlyArray<{ value: PlanBilling; label: string }> = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'annual', label: 'Anual' },
];

export function PlanPricingSection() {
  const [billing, setBilling] = useState<PlanBilling>('monthly');

  return (
    <div className="flex flex-col items-center gap-16 w-full max-w-7xl mx-auto">
      <div className="flex flex-col items-center gap-6 text-center max-w-2xl">
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-3xl md:text-4xl font-bold">Planos</h2>
          <p className="text-white/60">Escolha o plano que acompanha o ritmo de crescimento da sua empresa.</p>
        </div>

        <div
          role="group"
          aria-label="Periodicidade de cobrança"
          className="flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] p-1"
        >
          {BILLING_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={billing === option.value}
              onClick={() => setBilling(option.value)}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition cursor-pointer',
                billing === option.value ? 'bg-accent text-white' : 'text-white/60 hover:text-white',
              )}
            >
              {option.label}
              {option.value === 'annual' && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    billing === 'annual' ? 'bg-white/20 text-white' : 'bg-accent/20 text-accent',
                  )}
                >
                  {FREE_MONTHS} meses grátis
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {PLAN_COPY.map((plan) => (
          <PlanCard key={plan.name} plan={plan} billing={billing} />
        ))}
      </div>

      <p className="text-sm text-white/50 text-center max-w-2xl">
        Valores por empresa, sem cobrança por usuário. No plano anual, o valor total é cobrado de uma vez e equivale a {ANNUAL_BILLED_MONTHS}{' '}
        mensalidades. Currículos além da franquia do plano são cobrados como excedente. Condições para volume alto são negociadas com a nossa equipe.
      </p>
    </div>
  );
}
