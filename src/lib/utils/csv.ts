export type CsvRow = Record<string, string | number | null | undefined>;

function escapeCsvValue(value: string | number | null | undefined): string {
  const stringValue = value === null || value === undefined ? '' : String(value);

  if (/[",\n;]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function buildCsv(headers: string[], rows: CsvRow[]): string {
  const headerLine = headers.map(escapeCsvValue).join(';');
  const lines = rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(';'));

  return ['﻿' + headerLine, ...lines].join('\n');
}

export function downloadCsv(fileName: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
