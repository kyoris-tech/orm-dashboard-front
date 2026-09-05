'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { JobOpeningFormDialog } from './JobOpeningFormDialog';
import { JobOpeningsTable } from './JobOpeningsTable';
import { useCreateJobOpeningMutation } from '../hooks/use-create-job-opening-mutation';
import type { CreateJobOpeningInput } from '@/types/job-opening';
import { extractErrorMessage } from '@/lib/utils/error';

export function JobOpeningsView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createJobOpeningMutation = useCreateJobOpeningMutation();

  function handleSubmit(input: CreateJobOpeningInput) {
    createJobOpeningMutation.mutate(input, {
      onSuccess: () => setIsCreateOpen(false),
      onError: (error) => setErrorMessage(extractErrorMessage(error)),
    });
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <Button type="button" variant="accent" onClick={() => setIsCreateOpen(true)} className="!w-auto !py-2 !px-4 text-sm flex items-center gap-2">
          <Plus size={16} />
          Adicionar Vaga
        </Button>
      </div>

      <JobOpeningsTable />

      <JobOpeningFormDialog
        isOpen={isCreateOpen}
        jobOpening={null}
        isSubmitting={createJobOpeningMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => setIsCreateOpen(false)}
      />

      {errorMessage && <Toast message={errorMessage} onDismiss={() => setErrorMessage(null)} />}
    </div>
  );
}
