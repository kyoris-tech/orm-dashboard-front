'use client';

import { X } from 'lucide-react';

export interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export function Toast({ message, actionLabel, onAction, onDismiss }: ToastProps) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] bg-surface border border-border rounded-full shadow-lg pl-5 pr-2 py-2 flex items-center gap-3 text-sm">
      <span className="text-foreground">{message}</span>

      {actionLabel && onAction && (
        <button onClick={onAction} className="text-accent font-semibold hover:text-accent-dark transition px-2">
          {actionLabel}
        </button>
      )}

      {onDismiss && (
        <button onClick={onDismiss} title="Fechar" aria-label="Fechar" className="text-muted hover:text-foreground transition p-1">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
