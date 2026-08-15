'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateJobOpeningDialog } from './CreateJobOpeningDialog';
import { JobOpeningsTable } from './JobOpeningsTable';
import { useCreateJobOpeningMutation } from '../hooks/use-create-job-opening-mutation';
import type { CreateJobOpeningInput } from '@/types/job-opening';

export function JobOpeningsView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createJobOpeningMutation = useCreateJobOpeningMutation();

  function handleSubmit(input: CreateJobOpeningInput) {
    createJobOpeningMutation.mutate(input, {
      onSuccess: () => setIsCreateOpen(false),
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

      <CreateJobOpeningDialog
        isOpen={isCreateOpen}
        isSubmitting={createJobOpeningMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
