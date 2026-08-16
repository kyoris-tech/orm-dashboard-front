export function buildJobOpeningPublicUrl(publicCode: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/vagas/${publicCode}`;
}
