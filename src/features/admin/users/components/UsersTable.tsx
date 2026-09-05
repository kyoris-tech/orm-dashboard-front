'use client';

import { useMemo, useState } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Ban, CircleCheck, KeyRound, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { usePagination } from '@/lib/hooks/use-pagination';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils/date';
import { useSessionUser } from '@/context/SessionProvider';
import { useUsersQuery } from '../hooks/use-users-query';
import { useUpdateUserStatusMutation } from '../hooks/use-update-user-status-mutation';
import { useUpdateUserPasswordMutation } from '../hooks/use-update-user-password-mutation';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { ALL_COMPANIES_VALUE } from '../constants';
import { ROLE_LABELS, USER_STATUS_LABELS, USER_STATUS_TONES } from '../labels';
import type { UserSummary } from '@/types/user';
import { extractErrorMessage } from '@/lib/utils/error';

const columnHelper = createColumnHelper<UserSummary>();

export interface UsersTableProps {
  companyFilter: string;
}

export function UsersTable({ companyFilter }: UsersTableProps) {
  const sessionUser = useSessionUser();
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const usersQuery = useUsersQuery({
    page,
    pageSize,
    companyId: companyFilter === ALL_COMPANIES_VALUE ? undefined : companyFilter,
  });
  const updateStatusMutation = useUpdateUserStatusMutation();
  const updatePasswordMutation = useUpdateUserPasswordMutation();

  const [blockingUser, setBlockingUser] = useState<UserSummary | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserSummary | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<UserSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleConfirmBlockToggle() {
    if (!blockingUser) {
      return;
    }

    const nextStatus = blockingUser.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';

    updateStatusMutation.mutate(
      { id: blockingUser.id, status: nextStatus },
      {
        onSuccess: () => setBlockingUser(null),
        onError: (error) => setErrorMessage(extractErrorMessage(error)),
      },
    );
  }

  function handleConfirmDelete() {
    if (!deletingUser) {
      return;
    }

    updateStatusMutation.mutate(
      { id: deletingUser.id, status: 'DELETED' },
      {
        onSuccess: () => setDeletingUser(null),
        onError: (error) => setErrorMessage(extractErrorMessage(error)),
      },
    );
  }

  function handleChangePassword(password: string) {
    if (!changingPasswordUser) {
      return;
    }

    updatePasswordMutation.mutate(
      { id: changingPasswordUser.id, password },
      {
        onSuccess: () => {
          setSuccessMessage(`Senha de "${changingPasswordUser.name}" alterada com sucesso.`);
          setChangingPasswordUser(null);
        },
        onError: (error) => setErrorMessage(extractErrorMessage(error)),
      },
    );
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Nome' }),
      columnHelper.accessor('email', { header: 'E-mail' }),
      columnHelper.accessor((row) => row.company?.name ?? 'N/A', {
        id: 'company',
        header: 'Empresa',
      }),
      columnHelper.accessor((row) => ROLE_LABELS[row.role.name], {
        id: 'role',
        header: 'Permissão',
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <Badge tone={USER_STATUS_TONES[info.getValue()]}>{USER_STATUS_LABELS[info.getValue()]}</Badge>,
      }),
      columnHelper.accessor('createdAt', {
        header: 'Criado em',
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Ações',
        cell: (info) => {
          const user = info.row.original;
          const isDeleted = user.status === 'DELETED';
          const isSelf = user.id === sessionUser?.id;
          const isBlocked = user.status !== 'ACTIVE';

          return (
            <div className="flex items-center gap-3">
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  setChangingPasswordUser(user);
                }}
                disabled={isDeleted}
                title="Alterar senha"
                aria-label="Alterar senha"
              >
                <KeyRound size={16} />
              </IconButton>

              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  setBlockingUser(user);
                }}
                disabled={isDeleted}
                title={isBlocked ? 'Ativar usuário' : 'Bloquear usuário'}
                aria-label={isBlocked ? 'Ativar usuário' : 'Bloquear usuário'}
              >
                {isBlocked ? <CircleCheck size={16} /> : <Ban size={16} />}
              </IconButton>

              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  setDeletingUser(user);
                }}
                disabled={isDeleted || isSelf}
                title={isSelf ? 'Você não pode excluir seu próprio usuário' : 'Excluir usuário'}
                aria-label="Excluir usuário"
                tone="danger"
              >
                <Trash2 size={16} />
              </IconButton>
            </div>
          );
        },
      }),
    ],
    [sessionUser?.id],
  );

  const data = useMemo(() => usersQuery.data?.data ?? [], [usersQuery.data]);
  const pagination = usersQuery.data?.pagination;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-[300px] relative overflow-x-auto">
      <DataTable
        table={table}
        isLoading={usersQuery.isLoading}
        isError={usersQuery.isError}
        errorMessage="Não foi possível carregar os usuários."
        emptyMessage={companyFilter === ALL_COMPANIES_VALUE ? 'Nenhum usuário cadastrado ainda.' : 'Nenhum usuário para esta empresa.'}
      />

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalLabel={`${pagination.totalItems} usuário(s)`}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(blockingUser)}
        title={blockingUser?.status === 'ACTIVE' ? 'Bloquear usuário' : 'Ativar usuário'}
        message={
          blockingUser?.status === 'ACTIVE'
            ? `"${blockingUser?.name}" perderá acesso ao sistema até ser reativado. Confirma?`
            : `"${blockingUser?.name}" voltará a ter acesso ao sistema. Confirma?`
        }
        confirmLabel={updateStatusMutation.isPending ? 'Aplicando...' : 'Confirmar'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmBlockToggle}
        onCancel={() => setBlockingUser(null)}
        tone={blockingUser?.status === 'ACTIVE' ? 'danger' : 'default'}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingUser)}
        title="Excluir usuário"
        message={`Isso desativa "${deletingUser?.name}" (soft delete). Confirma?`}
        confirmLabel={updateStatusMutation.isPending ? 'Excluindo...' : 'Excluir usuário'}
        cancelLabel="Voltar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingUser(null)}
        tone="danger"
      />

      <ChangePasswordDialog
        isOpen={Boolean(changingPasswordUser)}
        user={changingPasswordUser}
        isSubmitting={updatePasswordMutation.isPending}
        onSubmit={handleChangePassword}
        onCancel={() => setChangingPasswordUser(null)}
      />

      {errorMessage && <Toast message={errorMessage} onDismiss={() => setErrorMessage(null)} />}
      {successMessage && <Toast message={successMessage} onDismiss={() => setSuccessMessage(null)} />}
    </div>
  );
}
