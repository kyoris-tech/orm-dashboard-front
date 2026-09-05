export interface ManualTableProps {
  headers: string[];
  rows: React.ReactNode[][];
}

export function ManualTable({ headers, rows }: ManualTableProps) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="whitespace-nowrap border-b border-border bg-surface-soft px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((cells, rowIndex) => (
            <tr key={rowIndex}>
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b border-border/50 px-4 py-3 align-top text-foreground last:border-b-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
