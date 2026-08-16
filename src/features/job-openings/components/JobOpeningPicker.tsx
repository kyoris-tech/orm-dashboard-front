'use client';

import { useMemo } from 'react';
import { Select } from '@/components/ui/Select';
import { useJobOpeningsQuery } from '../hooks/use-job-openings-query';

export interface JobOpeningPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const NO_JOB_OPENING_OPTION = { value: '', label: 'Nenhuma vaga vinculada' };

export function JobOpeningPicker({ value, onChange, disabled }: JobOpeningPickerProps) {
  const jobOpeningsQuery = useJobOpeningsQuery();

  const options = useMemo(() => {
    const openJobOpenings = (jobOpeningsQuery.data ?? []).filter((jobOpening) => jobOpening.status === 'OPEN');
    return [NO_JOB_OPENING_OPTION, ...openJobOpenings.map((jobOpening) => ({ value: jobOpening.id, label: jobOpening.title }))];
  }, [jobOpeningsQuery.data]);

  return (
    <Select value={value} onChange={(event) => onChange(event.target.value)} options={options} disabled={disabled || jobOpeningsQuery.isLoading} />
  );
}
