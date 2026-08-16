'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PricingToggle, type BillingCycle } from './PricingToggle';
import { PricingCard } from './PricingCard';
import { ENTERPRISE_PLAN, PRICED_PLANS } from '../content';

export function PlanPricingSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] gap-16 items-center w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-6 text-left">
        <PricingToggle value={billingCycle} onChange={setBillingCycle} />

        <h2 className="text-4xl md:text-5xl font-bold leading-tight">Quantos candidatos sua empresa vai analisar por mês?</h2>

        <p className="text-white/60 leading-relaxed">
          Escolha o volume de análises que sua empresa precisa. Você pode trocar de plano a qualquer momento conforme sua operação
          cresce.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PRICED_PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} billingCycle={billingCycle} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
          <div className="flex flex-col justify-center gap-2 rounded-3xl border border-white/15 bg-white/[0.03] px-8 py-6">
            <h3 className="text-2xl font-bold text-white">{ENTERPRISE_PLAN.name}</h3>
            <p className="text-accent font-semibold">análise ilimitada /mês</p>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-3xl border border-white/15 bg-white/[0.03] px-8 py-6 text-center">
            <span className="text-xs text-white/40">Fatura Mensal</span>
            <p className="text-white">
              <span className="text-sm align-top">R$</span>
              <span className="text-2xl font-bold">{ENTERPRISE_PLAN.pricePerAnalysis.toFixed(2).replace('.', ',')}</span>
              <span className="text-sm">/análise</span>
            </p>
            <span className="text-xs text-white/40">Mínimo {ENTERPRISE_PLAN.minAnalyses} consultas</span>

            <Link
              href="/login"
              className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
            >
              Conhecer Enterprise
            </Link>
          </div>
        </div>

        <Link href="/login" className="text-accent font-semibold text-sm text-center hover:underline">
          Plano Personalizado — para empresas nacionais e globais
        </Link>
      </div>
    </div>
  );
}
