'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { PlansTable } from './PlansTable';
import { PlanFormDialog } from './PlanFormDialog';
import { useCreatePlanMutation } from '../hooks/use-create-plan-mutation';
import type { CreatePlanInput } from '@/types/company';
import { extractErrorMessage } from '@/lib/utils/error';

export function PlansView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createPlanMutation = useCreatePlanMutation();

  function handleCreate(input: CreatePlanInput) {
    createPlanMutation.mutate(input, {
      onSuccess: () => setIsCreateOpen(false),
      onError: (error) => setErrorMessage(extractErrorMessage(error)),
    });
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <Button type="button" variant="accent" onClick={() => setIsCreateOpen(true)} className="!w-auto !py-2 !px-4 text-sm flex items-center gap-2">
          <Plus size={16} />
          Adicionar Plano
        </Button>
      </div>

      <PlansTable />

      <PlanFormDialog
        isOpen={isCreateOpen}
        plan={null}
        isSubmitting={createPlanMutation.isPending}
        onSubmit={handleCreate}
        onCancel={() => setIsCreateOpen(false)}
      />

      {errorMessage && <Toast message={errorMessage} onDismiss={() => setErrorMessage(null)} />}
    </div>
  );
}
