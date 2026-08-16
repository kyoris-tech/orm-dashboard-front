import Link from 'next/link';
import type { BillingCycle } from './PricingToggle';
import type { PricedPlanCopy } from '../content';

export interface PricingCardProps {
  plan: PricedPlanCopy;
  billingCycle: BillingCycle;
}

function splitPrice(value: number): { whole: string; cents: string } {
  const [whole, cents] = value.toFixed(2).split('.');
  return { whole, cents };
}

export function PricingCard({ plan, billingCycle }: PricingCardProps) {
  const isAnnual = billingCycle === 'annual';
  const activePrice = isAnnual ? plan.priceAnnual : plan.priceMonthly;
  const { whole, cents } = splitPrice(activePrice);

  return (
    <div className="relative flex flex-col gap-6 rounded-3xl border border-white/15 bg-white/[0.03] pt-10 px-6 pb-6 text-center">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#05070c] px-4">
        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
      </div>

      <p className="text-sm text-white/60 leading-relaxed">{plan.tagline}</p>

      <p className="text-sm text-white/70">
        até <span className="text-accent font-bold">{plan.analysesPerMonth}</span> /mês
      </p>

      <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 py-5">
        {isAnnual && <span className="text-xs text-white/40 line-through">{plan.priceMonthly.toFixed(2).replace('.', ',')}</span>}

        <p className="text-white">
          <span className="text-sm align-top">R$</span>
          <span className="text-3xl font-bold">{whole}</span>
          <span className="text-sm">,{cents}/mês</span>
        </p>

        <span className="text-xs text-white/40">{isAnnual ? 'Assinatura Anual' : 'Assinatura Mensal'}</span>
      </div>

      <Link
        href="/login"
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
      >
        Assinar Plano
      </Link>
    </div>
  );
}
