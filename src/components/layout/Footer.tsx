'use client';

import { usePathname } from 'next/navigation';
import { Copyright } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  if (pathname === '/') {
    return null;
  }

  return (
    <footer className="w-full flex flex-col items-center gap-1 py-6 text-muted">
      <div className="flex items-center gap-1">
        <Copyright size={16} />
        <span className="font-semibold text-base">Orm. All rights reserved</span>
      </div>

      <a
        href="https://kyoristech.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs hover:text-accent transition"
      >
        Desenvolvido pela Kyoris Tech
      </a>

      <a
        href="https://www.linkedin.com/in/eveone/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs hover:text-accent transition"
      >
        Design e Direção de arte por Evelin Monteiro
      </a>
    </footer>
  );
}
