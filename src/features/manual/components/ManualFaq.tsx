export interface ManualFaqItem {
  question: string;
  answer: string;
}

export interface ManualFaqProps {
  items: ManualFaqItem[];
}

export function ManualFaq({ items }: ManualFaqProps) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      {items.map((item) => (
        <details key={item.question} className="overflow-hidden rounded-xl border border-border bg-surface">
          <summary className="cursor-pointer px-5 py-4 font-semibold text-foreground marker:content-['']">
            {item.question}
          </summary>

          <p className="border-t border-border/50 px-5 py-4 text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
