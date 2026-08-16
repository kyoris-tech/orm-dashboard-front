import { PlanCard } from './PlanCard';
import { PLAN_COPY } from '../content';

export function PlanPricingSection() {
  return (
    <div className="flex flex-col items-center gap-16 w-full max-w-6xl mx-auto">
      <div className="flex flex-col items-center gap-3 text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold">Planos</h2>
        <p className="text-white/60">Escolha o plano que acompanha o ritmo de crescimento da sua empresa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {PLAN_COPY.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>

      <p className="text-sm text-white/50">Fale com a nossa equipe para conhecer os valores de cada plano.</p>
    </div>
  );
}
