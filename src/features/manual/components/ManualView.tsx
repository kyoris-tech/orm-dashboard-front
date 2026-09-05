'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSessionUser } from '@/context/SessionProvider';
import { getManualSections } from '../sections';
import { ManualSection } from './ManualSection';

const PROSE_CLASSES = [
  '[&_p]:mb-4 [&_p]:max-w-[66ch] [&_p]:leading-relaxed [&_p]:text-foreground',
  '[&_ul]:mb-5 [&_ul]:max-w-[66ch] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-foreground',
  '[&_li]:mb-2 [&_li]:leading-relaxed',
  '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground',
  '[&_strong]:font-semibold',
].join(' ');

export function ManualView() {
  const sessionUser = useSessionUser();
  const isAdmin = sessionUser?.role === 'admin';
  const sections = getManualSections(isAdmin);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 pb-24 md:flex-row md:gap-14 md:px-8">
      <aside className="w-full shrink-0 md:sticky md:top-6 md:max-h-[calc(100vh-3rem)] md:w-60 md:self-start md:overflow-y-auto">
        <div className="border-b border-border pb-4">
          <p className="font-semibold text-foreground">Manual da Orm</p>
          <p className="text-xs text-muted">
            {isAdmin ? 'Versão do administrador' : 'Guia do usuário'}
          </p>
        </div>

        <nav className="mt-4 flex flex-col gap-1">
          {sections.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex items-baseline gap-3 rounded-lg px-2 py-1.5 text-sm text-muted transition hover:bg-surface-soft hover:text-foreground"
            >
              <span className="w-5 text-right text-xs tabular-nums text-muted">{index + 1}</span>
              <span>{section.navLabel}</span>
            </a>
          ))}
        </nav>

        <Link
          href="/home"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-dark"
        >
          <ArrowLeft size={16} /> Voltar ao sistema
        </Link>
      </aside>

      <main className={`min-w-0 flex-1 ${PROSE_CLASSES}`}>
        <header className="border-b border-border pb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.13em] text-accent">
            Guia do usuário
          </span>

          <h1 className="mt-3 mb-4 text-4xl font-bold tracking-tight text-foreground">
            Manual da Orm Intelligence
          </h1>

          <p className="max-w-[58ch] text-lg text-muted">
            Como importar currículos, encontrar os candidatos certos, conduzir processos seletivos e
            publicar vagas — passo a passo, com as telas do sistema.
          </p>

          <div className="mt-6 rounded-xl bg-surface-soft px-5 py-4">
            <p className="mb-2">
              <strong>Este manual acompanha o seu acesso.</strong> Você está vendo as{' '}
              {sections.length} seções disponíveis para o seu perfil
              {isAdmin ? ' de administrador' : ''}.
            </p>
            <p className="mb-0">
              As telas usam <strong>candidatos e empresas fictícios</strong>, criados só para
              ilustrar. Os seus dados reais aparecerão no lugar deles.
            </p>
          </div>
        </header>

        {sections.map((section, index) => (
          <ManualSection key={section.id} id={section.id} number={index + 1} title={section.title}>
            <section.Content isAdmin={isAdmin} />
          </ManualSection>
        ))}

        <footer className="mt-16 border-t border-border pt-6 text-sm text-muted">
          <p className="mb-2">Manual da Orm Intelligence · Plataforma operada pela Kyoris Tech.</p>
          <p className="mb-0">
            As telas usam candidatos e empresas fictícios, criados apenas para ilustração.
          </p>
        </footer>
      </main>
    </div>
  );
}
