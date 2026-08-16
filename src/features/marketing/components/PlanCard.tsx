import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { buildWhatsappLink } from '@/lib/utils/whatsapp';
import { FEATURE_LABELS } from '@/features/plan/labels';
import { ALL_PLAN_FEATURES, type PlanCopy } from '../content';

export interface PlanCardProps {
  plan: PlanCopy;
}

export function PlanCard({ plan }: PlanCardProps) {
  const whatsappLink = buildWhatsappLink(`Olá! Tenho interesse no plano ${plan.name} da Orm Intelligence.`);

  return (
    <div
      className={cn(
        'relative flex flex-col gap-6 rounded-3xl border pt-10 px-6 pb-6 text-center',
        plan.highlighted ? 'border-accent bg-white/[0.06] shadow-[0_0_40px_-12px_var(--color-accent)]' : 'border-white/15 bg-white/[0.03]',
      )}
    >
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#05070c] px-4">
        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
        {plan.highlighted && <span className="px-3 py-0.5 rounded-full bg-accent text-white text-xs font-medium">Mais popular</span>}
      </div>

      <p className="text-sm text-white/60 leading-relaxed">{plan.tagline}</p>

      <div className="flex flex-col gap-1 rounded-2xl bg-white/5 py-5">
        <p className="font-semibold text-white">{plan.maxUsersLabel}</p>
        <p className="font-semibold text-white">{plan.maxResumesLabel}</p>
      </div>

      <ul className="flex flex-col gap-2 text-sm text-left">
        {ALL_PLAN_FEATURES.map((feature) => {
          const included = plan.features.includes(feature);
          return (
            <li key={feature} className={cn('flex items-center gap-2', included ? 'text-white' : 'text-white/40')}>
              {included ? <CheckCircle size={16} className="text-accent shrink-0" /> : <Circle size={16} className="shrink-0" />}
              {FEATURE_LABELS[feature]}
            </li>
          );
        })}
      </ul>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
      >
        Assinar Plano
      </a>
    </div>
  );
}
