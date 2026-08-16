import Link from 'next/link';
import { Copyright } from 'lucide-react';
import { LandingNav } from './LandingNav';
import { GlowOrb } from './GlowOrb';
import { CapabilityOrbit } from './CapabilityOrbit';
import { PlanPricingSection } from './PlanPricingSection';

export function LandingView() {
  return (
    <div className="w-full text-white">
      <LandingNav />

      <section id="topo" className="relative min-h-screen flex flex-col overflow-hidden bg-[#05070c]">
        <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <GlowOrb />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Orm Intelligence</h1>
            <p className="text-base md:text-lg text-white/70">Descubra uma forma inteligente de analisar candidatos para sua empresa</p>
            <Link
              href="/login"
              className="px-8 py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent-dark transition"
            >
              Conhecer o Sistema
            </Link>
          </div>
        </div>
      </section>

      <section id="empresa" className="min-h-screen flex items-center gap-12 px-6 md:px-16 py-24 bg-[#0a0f18] border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full max-w-6xl mx-auto">
          <div className="flex flex-col gap-6 text-left">
            <p className="text-sm text-white/60">Na Orm você tem:</p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">Mais eficiência na análise de dados dos candidatos</h2>
            <p className="text-white font-semibold">Uma plataforma só, do currículo à contratação</p>
            <p className="text-white/60 leading-relaxed">
              Centralize a triagem de currículos, a análise de candidatos com inteligência artificial, a condução de processos seletivos e
              a publicação de vagas em um só lugar, sem depender de planilhas paralelas ou processos manuais espalhados por vários
              sistemas.
            </p>
          </div>

          <CapabilityOrbit />
        </div>
      </section>

      <section id="planos" className="min-h-screen flex flex-col justify-center items-center px-6 py-24 bg-[#05070c] border-t border-white/5">
        <PlanPricingSection />
      </section>

      <section id="sobre" className="min-h-screen flex flex-col justify-center items-center gap-10 px-6 py-24 bg-[#0a0f18] border-t border-white/5 text-center">
        <div className="flex flex-col items-center gap-4 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold">Conheça a Orm</h2>
          <p className="text-white/60 leading-relaxed">
            A Orm Intelligence é a plataforma da Kyoris Tech para recrutamento orientado a dados: reúna currículos, analise candidatos com
            inteligência artificial e acompanhe cada processo seletivo do início ao fim, tudo em um só lugar.
          </p>
        </div>

        <Link
          href="/login"
          className="px-8 py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent-dark transition"
        >
          Conhecer o Sistema
        </Link>

        <div className="flex flex-col items-center gap-1 text-white/40 mt-10">
          <div className="flex items-center gap-1">
            <Copyright size={16} />
            <span className="font-semibold text-sm">Orm. All rights reserved</span>
          </div>

          <a
            href="https://kyoristech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:text-accent transition"
          >
            Desenvolvido pela Kyoris Tech
          </a>

          <a
            href="https://www.linkedin.com/in/eveone/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:text-accent transition"
          >
            Design e Direção de arte por Evelin Monteiro
          </a>
        </div>
      </section>
    </div>
  );
}
