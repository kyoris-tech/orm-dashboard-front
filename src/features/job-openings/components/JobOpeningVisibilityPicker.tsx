'use client';

import { Globe, Lock } from 'lucide-react';
import { Radio } from '@/components/ui/Radio';
import { cn } from '@/lib/utils/cn';
import { JOB_OPENING_VISIBILITY_DESCRIPTIONS, JOB_OPENING_VISIBILITY_LABELS } from '../labels';
import type { JobOpeningVisibility } from '@/types/job-opening';

const OPTIONS: readonly { value: JobOpeningVisibility; Icon: typeof Globe }[] = [
  { value: 'PUBLIC', Icon: Globe },
  { value: 'PRIVATE', Icon: Lock },
];

export interface JobOpeningVisibilityPickerProps {
  value: JobOpeningVisibility;
  onChange: (visibility: JobOpeningVisibility) => void;
}

export function JobOpeningVisibilityPicker({ value, onChange }: JobOpeningVisibilityPickerProps) {
  return (
    <fieldset>
      <legend className="text-sm text-muted mb-2">Quem pode ver esta vaga</legend>

      <div className="flex flex-col gap-2">
        {OPTIONS.map(({ value: optionValue, Icon }) => {
          const isSelected = value === optionValue;

          return (
            <label
              key={optionValue}
              className={cn(
                'flex items-start gap-3 border rounded-xl px-4 py-3 cursor-pointer transition',
                isSelected ? 'border-accent bg-accent/5' : 'border-border hover:bg-surface-soft',
              )}
            >
              <Radio
                name="job-opening-visibility"
                checked={isSelected}
                onChange={() => onChange(optionValue)}
                className="mt-0.5"
              />

              <span className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon size={16} className={isSelected ? 'text-accent' : 'text-muted'} />
                  {JOB_OPENING_VISIBILITY_LABELS[optionValue]}
                </span>

                <span className="text-xs text-muted">{JOB_OPENING_VISIBILITY_DESCRIPTIONS[optionValue]}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
