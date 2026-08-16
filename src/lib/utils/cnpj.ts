export function formatCnpj(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').slice(0, 14);

  const parts = [
    [0, 2],
    [2, 5],
    [5, 8],
    [8, 12],
    [12, 14],
  ];

  let formatted = '';

  parts.forEach(([start, end], index) => {
    if (digits.length > start) {
      formatted += digits.slice(start, end);

      if (index === 0 || index === 1) formatted += digits.length > end ? '.' : '';
      if (index === 2) formatted += digits.length > end ? '/' : '';
      if (index === 3) formatted += digits.length > end ? '-' : '';
    }
  });

  return formatted;
}
