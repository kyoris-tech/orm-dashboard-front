'use client';

import { useMemo, useState } from 'react';
import { Download, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Select } from '@/components/ui/Select';
import { CreateUserDialog } from './CreateUserDialog';
import { UsersTable } from './UsersTable';
import { useCreateUserMutation } from '../hooks/use-create-user-mutation';
import { useExportUsersMutation } from '../hooks/use-export-users-mutation';
import { useCompaniesQuery } from '../../companies/hooks/use-companies-query';
import { exportUsersToCsv, exportUsersToPdf } from '../export';
import { ALL_COMPANIES_VALUE } from '../constants';
import type { CreateUserInput } from '@/types/user';

type ExportFormat = 'csv' | 'pdf' | null;

export function UsersView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState(ALL_COMPANIES_VALUE);
  const createUserMutation = useCreateUserMutation();
  const exportUsersMutation = useExportUsersMutation();
  const companiesQuery = useCompaniesQuery();

  const companyFilterOptions = useMemo(
    () => [
      { value: ALL_COMPANIES_VALUE, label: 'Todas as empresas' },
      ...(companiesQuery.data ?? []).map((company) => ({ value: company.id, label: company.name })),
    ],
    [companiesQuery.data],
  );

  function handleSubmit(input: CreateUserInput) {
    createUserMutation.mutate(input, {
      onSuccess: () => setIsCreateOpen(false),
    });
  }

  function handleExportCsv() {
    setExportingFormat('csv');

    exportUsersMutation.mutate(undefined, {
      onSuccess: (records) => {
        exportUsersToCsv(records);
        setExportingFormat(null);
      },
      onError: () => {
        setExportError('Não foi possível exportar os usuários.');
        setExportingFormat(null);
      },
    });
  }

  function handleExportPdf() {
    setExportingFormat('pdf');

    exportUsersMutation.mutate(undefined, {
      onSuccess: async (records) => {
        try {
          await exportUsersToPdf(records);
        } catch {
          setExportError('Não foi possível gerar o PDF dos usuários.');
        } finally {
          setExportingFormat(null);
        }
      },
      onError: () => {
        setExportError('Não foi possível exportar os usuários.');
        setExportingFormat(null);
      },
    });
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted whitespace-nowrap">Empresa</span>
          <Select
            options={companyFilterOptions}
            value={companyFilter}
            onChange={(event) => setCompanyFilter(event.target.value)}
            className="!h-11 min-w-[220px]"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exportingFormat !== null}
            title="Exporta todos os usuários da base em CSV, incluindo bloqueados e excluídos, com datas e responsáveis por cada mudança de status"
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-full border border-border text-foreground hover:bg-surface-soft transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download size={16} />
            {exportingFormat === 'csv' ? 'Exportando...' : 'Exportar CSV'}
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingFormat !== null}
            title="Exporta todos os usuários da base em PDF, com o mesmo conteúdo do CSV, timbrado com a marca Orm/Kyoris"
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-full border border-border text-foreground hover:bg-surface-soft transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <FileText size={16} />
            {exportingFormat === 'pdf' ? 'Gerando PDF...' : 'Exportar PDF'}
          </button>

          <Button
            type="button"
            variant="accent"
            onClick={() => setIsCreateOpen(true)}
            className="!w-auto !py-2 !px-4 text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            Adicionar usuário
          </Button>
        </div>
      </div>

      <UsersTable companyFilter={companyFilter} />

      <CreateUserDialog
        isOpen={isCreateOpen}
        isSubmitting={createUserMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => setIsCreateOpen(false)}
      />

      {exportError && <Toast message={exportError} onDismiss={() => setExportError(null)} />}
    </div>
  );
}
