'use client';

import { useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { useSessionUser } from '@/context/SessionProvider';
import { useRecentResumesQuery } from '../hooks/use-recent-resumes-query';
import { useUndoableDelete } from '../hooks/use-undoable-delete';
import { useHardDeleteResumeMutation } from '../hooks/use-hard-delete-resume-mutation';
import { downloadResumePdf } from '../api';
import { ResumeCard } from './ResumeCard';
import { ResumeModal } from './ResumeModal';
import type { ResumeSummary } from '@/types/resumes';

export function RecentImports() {
  const sessionUser = useSessionUser();
  const isAdmin = sessionUser?.role === 'admin';

  const recentResumesQuery = useRecentResumesQuery();
  const { requestDelete, undoDelete, dismiss, pendingId, isDeleting } = useUndoableDelete();
  const hardDeleteResumeMutation = useHardDeleteResumeMutation();

  const [selectedResume, setSelectedResume] = useState<ResumeSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [hardDeleteId, setHardDeleteId] = useState<string | null>(null);

  const resumes = recentResumesQuery.data ?? [];

  const handleOpenResume = useCallback((resume: ResumeSummary) => {
    setSelectedResume(resume);
    setIsModalOpen(true);
  }, []);

  const handleDownload = useCallback(async (resume: ResumeSummary) => {
    try {
      setDownloadError(null);
      await downloadResumePdf(resume.id, resume.fullName);
    } catch {
      setDownloadError('Não foi possível gerar o PDF deste currículo.');
    }
  }, []);

  function handleConfirmHardDelete() {
    if (!hardDeleteId) {
      return;
    }

    hardDeleteResumeMutation.mutate(hardDeleteId, {
      onSuccess: () => setHardDeleteId(null),
    });
  }

  function renderContent() {
    if (recentResumesQuery.isLoading) {
      return (
        <div className="flex justify-center items-center h-[10rem]">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      );
    }

    if (recentResumesQuery.isError) {
      return <p className="text-center text-danger font-medium mt-4">Não foi possível carregar os currículos recentes.</p>;
    }

    if (resumes.length === 0) {
      return <p className="text-center text-muted mt-6">Nenhum currículo recente encontrado.</p>;
    }

    return (
      <div className="mt-16">
        {downloadError && <p className="text-center text-danger text-sm mb-4">{downloadError}</p>}

        <h3 className="text-center text-muted text-lg font-medium mb-6">Confira suas últimas importações abaixo:</h3>

        <div className="flex md:justify-center justify-start gap-4 w-full overflow-x-auto">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onOpen={handleOpenResume}
              onDelete={(id) => requestDelete(id)}
              onDownload={handleDownload}
              onHardDelete={isAdmin ? setHardDeleteId : undefined}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {renderContent()}

      <ResumeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} resume={selectedResume} />

      {pendingId && (
        <Toast message={isDeleting ? 'Excluindo...' : 'Currículo excluído.'} actionLabel="Desfazer" onAction={undoDelete} onDismiss={dismiss} />
      )}

      <ConfirmDialog
        isOpen={Boolean(hardDeleteId)}
        title="Excluir permanentemente"
        message="Essa ação apaga o currículo definitivamente do banco de dados, sem possibilidade de desfazer. Confirma?"
        confirmLabel={hardDeleteResumeMutation.isPending ? 'Excluindo...' : 'Excluir permanentemente'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmHardDelete}
        onCancel={() => setHardDeleteId(null)}
        tone="danger"
      />
    </>
  );
}
