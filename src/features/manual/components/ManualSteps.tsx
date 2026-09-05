export interface ManualStepsProps {
  children: React.ReactNode;
}

export function ManualSteps({ children }: ManualStepsProps) {
  return <ol className="mb-6 flex list-none flex-col gap-4 p-0 [counter-reset:step]">{children}</ol>;
}

export interface ManualStepProps {
  children: React.ReactNode;
}

export function ManualStep({ children }: ManualStepProps) {
  return (
    <li className="relative pl-12 [counter-increment:step] before:absolute before:left-0 before:top-0 before:flex before:h-8 before:w-8 before:items-center before:justify-center before:rounded-full before:bg-accent before:text-sm before:font-semibold before:text-white before:content-[counter(step)]">
      {children}
    </li>
  );
}
