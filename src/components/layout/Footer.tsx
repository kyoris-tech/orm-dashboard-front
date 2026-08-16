import { Copyright } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full flex justify-center items-center py-6 text-muted">
      <div className="flex items-center gap-1">
        <Copyright size={16} />
        <span className="font-semibold text-base">Orm. All rights reserved</span>
      </div>
    </footer>
  );
}
