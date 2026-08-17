'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import type { UserSummary } from '@/types/user';

export interface ChangePasswordDialogProps {
  isOpen: boolean;
  user: UserSummary | null;
  isSubmitting?: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export function ChangePasswordDialog({ isOpen, user, isSubmitting, onSubmit, onCancel }: ChangePasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setPassword('');
    }
  }

  const isValid = password.trim().length >= 6;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!isValid) {
      return;
    }

    onSubmit(password);
  }

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8"
            >
              <h2 className="text-2xl font-semibold text-accent mb-2 text-center">Alterar senha</h2>
              <p className="text-sm text-muted text-center mb-6">
                Defina uma nova senha para <span className="font-medium text-foreground">{user?.name}</span>.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <PasswordInput
                  label="Nova senha (mínimo 6 caracteres)"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  autoFocus
                />

                <div className="flex gap-4 mt-2">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-2 rounded-full border border-border text-muted hover:bg-surface-soft transition font-medium"
                  >
                    Cancelar
                  </button>

                  <Button type="submit" variant="accent" loading={isSubmitting} disabled={!isValid} className="flex-1">
                    Salvar senha
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
