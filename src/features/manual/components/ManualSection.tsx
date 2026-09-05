export interface ManualSectionProps {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}

export function ManualSection({ id, number, title, children }: ManualSectionProps) {
  return (
    <section id={id} className="scroll-mt-6 pt-14 first:pt-0">
      <header className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Seção {number}</span>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
      </header>

      <div className="flex flex-col">{children}</div>
    </section>
  );
}
