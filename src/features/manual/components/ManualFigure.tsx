export interface ManualFigureProps {
  src: string;
  alt: string;
  caption: string;
}

export function ManualFigure({ src, alt, caption }: ManualFigureProps) {
  return (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element -- next/image serve por /_next/image, que fica fora da guarda de sessão */}
      <img src={src} alt={alt} className="w-full rounded-xl border border-border bg-surface shadow-lg" />
      <figcaption className="mt-3 text-center text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}
