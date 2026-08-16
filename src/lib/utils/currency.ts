const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(value: number): string {
  return BRL_FORMATTER.format(value);
}

export function centsToReais(digits: string): number {
  return Number(digits) / 100;
}

export function formatSalaryRange(min: number | undefined, max: number | undefined): string | undefined {
  if (min === undefined && max === undefined) {
    return undefined;
  }

  if (min !== undefined && max !== undefined && min !== max) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }

  return formatCurrency(min ?? (max as number));
}
