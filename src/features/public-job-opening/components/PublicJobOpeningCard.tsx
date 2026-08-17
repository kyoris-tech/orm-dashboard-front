'use client';

import { useRouter } from 'next/navigation';
import { Briefcase, Building2, Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/date';
import { CONTRACT_TYPE_LABELS, WORK_MODEL_LABELS } from '@/features/job-openings/labels';
import type { PublicJobOpeningSummary } from '@/types/public-job-opening';

const MAX_VISIBLE_REQUIREMENTS = 4;

export interface PublicJobOpeningCardProps {
  jobOpening: PublicJobOpeningSummary;
}

export function PublicJobOpeningCard({ jobOpening }: PublicJobOpeningCardProps) {
  const router = useRouter();
  const visibleRequirements = jobOpening.requirements.slice(0, MAX_VISIBLE_REQUIREMENTS);
  const hiddenRequirementsCount = jobOpening.requirements.length - visibleRequirements.length;

  return (
    <button
      type="button"
      onClick={() => router.push(`/vagas/${jobOpening.publicCode}`)}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 text-left transition hover:border-accent hover:shadow-lg cursor-pointer"
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground leading-snug">{jobOpening.title}</h3>
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <Building2 size={14} />
          {jobOpening.companyName}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge tone={jobOpening.workModel === 'REMOTE' ? 'success' : 'neutral'}>
          <MapPin size={12} className="mr-1 -ml-0.5" />
          {WORK_MODEL_LABELS[jobOpening.workModel]}
        </Badge>

        <Badge tone="accent">
          <Briefcase size={12} className="mr-1 -ml-0.5" />
          {CONTRACT_TYPE_LABELS[jobOpening.contractType]}
        </Badge>
      </div>

      {visibleRequirements.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleRequirements.map((requirement) => (
            <span key={requirement} className="px-2.5 py-1 rounded-full bg-surface-soft text-xs text-foreground">
              {requirement}
            </span>
          ))}

          {hiddenRequirementsCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-surface-soft text-xs text-muted">+{hiddenRequirementsCount}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted mt-auto pt-2 border-t border-border">
        <span>{jobOpening.salaryRange || 'Salário a combinar'}</span>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          {formatDate(jobOpening.createdAt)}
        </div>
      </div>
    </button>
  );
}
