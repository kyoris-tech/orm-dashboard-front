'use client';

import { useState } from 'react';
import { Check, Copy, KeyRound } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export interface NewTokenDialogProps {
  token: string | null;
  onClose: () => void;
}

export function NewTokenDialog({ token, onClose }: NewTokenDialogProps) {
  const [copied, setCopied] = useState(false);
  const [wasOpen, setWasOpen] = useState(Boolean(token));

  const isOpen = Boolean(token);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setCopied(false);
    }
  }

  async function handleCopy() {
    if (!token) {
      return;
    }

    await navigator.clipboard.writeText(token);
    setCopied(true);
  }

  return (
    <Modal isOpen={isOpen} className="text-center">
      <span className="inline-flex bg-surface-soft text-accent rounded-full p-3 mb-4">
        <KeyRound size={22} />
      </span>

      <h2 className="text-2xl font-semibold text-accent mb-2">Novo token gerado</h2>
      <p className="text-sm text-muted mb-6">Copie o token agora. Por segurança, ele não será exibido novamente.</p>

      <div className="flex items-center gap-2 bg-surface-soft border border-border rounded-xl px-4 py-3 mb-6">
        <code className="text-xs text-foreground break-all flex-1 text-left">{token}</code>
        <button
          onClick={handleCopy}
          title="Copiar token"
          className="shrink-0 text-accent hover:text-accent-dark transition p-1"
          aria-label="Copiar token"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>

      <button
        onClick={onClose}
        className="w-full px-6 py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent-dark transition"
      >
        Concluir
      </button>
    </Modal>
  );
}
