'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { CompaniesTable } from './CompaniesTable';
import { CreateCompanyDialog } from './CreateCompanyDialog';
import { useCreateCompanyMutation } from '../hooks/use-create-company-mutation';
import type { CreateCompanyInput } from '@/types/company';

const DEFAULT_ERROR_MESSAGE = 'Não foi possível concluir a ação.';

function extractErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? DEFAULT_ERROR_MESSAGE;
  }

  return DEFAULT_ERROR_MESSAGE;
}

export function CompaniesView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createCompanyMutation = useCreateCompanyMutation();

  function handleCreate(input: CreateCompanyInput) {
    createCompanyMutation.mutate(input, {
      onSuccess: () => setIsCreateOpen(false),
      onError: (error) => setErrorMessage(extractErrorMessage(error)),
    });
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <Button type="button" variant="accent" onClick={() => setIsCreateOpen(true)} className="!w-auto !py-2 !px-4 text-sm flex items-center gap-2">
          <Plus size={16} />
          Adicionar Empresa
        </Button>
      </div>

      <CompaniesTable />

      <CreateCompanyDialog
        isOpen={isCreateOpen}
        isSubmitting={createCompanyMutation.isPending}
        onSubmit={handleCreate}
        onCancel={() => setIsCreateOpen(false)}
      />

      {errorMessage && <Toast message={errorMessage} onDismiss={() => setErrorMessage(null)} />}
    </div>
  );
}
