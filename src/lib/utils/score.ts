export function scoreTone(value: number): string {
  if (value > 80) return 'bg-success';
  if (value >= 60) return 'bg-accent';
  if (value >= 30) return 'bg-[#FFD600] !text-[#001B30]';
  return 'bg-border !text-muted';
}
