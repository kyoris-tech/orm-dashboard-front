import { memo } from 'react';
import { CircleFadingArrowUp, CloudDownload, Flame, Trash } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import type { ResumeSummary } from '@/types/resumes';

export interface ResumeCardProps {
  resume: ResumeSummary;
  onOpen: (resume: ResumeSummary) => void;
  onDelete: (id: string) => void;
  onDownload: (resume: ResumeSummary) => void;
  onHardDelete?: (id: string) => void;
}

function ResumeCardComponent({ resume, onOpen, onDelete, onDownload, onHardDelete }: ResumeCardProps) {
  return (
    <div
      className="bg-surface-soft gap-3 rounded-xl px-6 py-5 w-[14.625rem] min-w-[14.625rem] h-[14.938rem] flex-shrink-0 text-left border border-border cursor-pointer flex flex-col items-baseline justify-center"
      onClick={() => onOpen(resume)}
    >
      <CircleFadingArrowUp className="text-muted h-8 w-8 font-normal" />

      <div className="text-primary text-lg font-semibold line-clamp-2 w-full">Currículo - {resume.fullName}</div>

      <p className="text-sm text-muted">Data: {formatDate(resume.createdAt)}</p>

      <div className="border border-border w-full" />

      <div className="flex flex-row w-full justify-between items-center">
        <button
          className="text-accent w-6 h-6"
          title="Baixar PDF"
          aria-label="Baixar PDF"
          onClick={(event) => {
            event.stopPropagation();
            onDownload(resume);
          }}
        >
          <CloudDownload />
        </button>

        <div className="flex items-center gap-3">
          {onHardDelete && (
            <button
              className="text-danger/70 w-5 h-5 hover:text-danger transition"
              title="Excluir permanentemente"
              aria-label="Excluir permanentemente"
              onClick={(event) => {
                event.stopPropagation();
                onHardDelete(resume.id);
              }}
            >
              <Flame size={18} />
            </button>
          )}

          <button
            className="text-foreground w-6 h-6 hover:text-danger transition"
            title="Excluir"
            aria-label="Excluir"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(resume.id);
            }}
          >
            <Trash />
          </button>
        </div>
      </div>
    </div>
  );
}

export const ResumeCard = memo(ResumeCardComponent);
