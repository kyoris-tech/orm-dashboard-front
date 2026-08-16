'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { useCompanyResumesQuery } from '@/features/resumes/hooks/use-company-resumes-query';

export interface AddCandidatesDialogProps {
  isOpen: boolean;
  existingResumeIds: string[];
  isSubmitting?: boolean;
  onSubmit: (resumeIds: string[]) => void;
  onCancel: () => void;
}

export function AddCandidatesDialog({ isOpen, existingResumeIds, isSubmitting, onSubmit, onCancel }: AddCandidatesDialogProps) {
  const companyResumesQuery = useCompanyResumesQuery();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setSearch('');
      setSelectedIds([]);
    }
  }

  const existingIdSet = useMemo(() => new Set(existingResumeIds), [existingResumeIds]);

  const availableResumes = useMemo(() => {
    const resumes = (companyResumesQuery.data ?? []).filter((resume) => !existingIdSet.has(resume.id));
    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch === '') {
      return resumes;
    }

    return resumes.filter((resume) => {
      const name = resume.dataJson?.fullName ?? resume.fullName ?? '';
      return name.toLowerCase().includes(normalizedSearch);
    });
  }, [companyResumesQuery.data, existingIdSet, search]);

  function toggleResume(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((resumeId) => resumeId !== id) : [...current, id]));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (selectedIds.length === 0) {
      return;
    }

    onSubmit(selectedIds);
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
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col max-h-[85vh]"
            >
              <h2 className="text-2xl font-semibold text-accent mb-4 text-center">Adicionar candidatos</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 min-h-0">
                <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome" />

                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 border border-border rounded-xl p-2">
                  {companyResumesQuery.isLoading && (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="animate-spin text-accent" size={22} />
                    </div>
                  )}

                  {companyResumesQuery.isError && <p className="text-danger text-sm text-center py-6">Não foi possível carregar os currículos.</p>}

                  {!companyResumesQuery.isLoading && !companyResumesQuery.isError && availableResumes.length === 0 && (
                    <p className="text-muted text-sm text-center py-6">
                      {existingResumeIds.length > 0 ? 'Todos os currículos já estão neste processo.' : 'Nenhum currículo encontrado.'}
                    </p>
                  )}

                  {availableResumes.map((resume) => {
                    const name = resume.dataJson?.fullName ?? resume.fullName;

                    return (
                      <label
                        key={resume.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-soft transition cursor-pointer"
                      >
                        <Checkbox checked={selectedIds.includes(resume.id)} onChange={() => toggleResume(resume.id)} />
                        <span className="text-sm text-foreground">{name}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-2 rounded-full border border-border text-muted hover:bg-surface-soft transition font-medium"
                  >
                    Cancelar
                  </button>

                  <Button type="submit" variant="accent" loading={isSubmitting} disabled={selectedIds.length === 0} className="flex-1 !w-auto">
                    Adicionar{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
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
