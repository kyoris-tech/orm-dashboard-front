'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface TagListInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function TagListInput({ label, values, onChange, placeholder }: TagListInputProps) {
  const [draft, setDraft] = useState('');

  function addValue() {
    const trimmed = draft.trim();

    if (trimmed === '') {
      return;
    }

    onChange([...values, trimmed]);
    setDraft('');
  }

  function removeValue(index: number) {
    onChange(values.filter((_, valueIndex) => valueIndex !== index));
  }

  return (
    <div className="flex flex-col gap-2 w-full text-left">
      <span className="text-sm font-medium text-foreground">{label}</span>

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addValue();
            }
          }}
          placeholder={placeholder}
          className="flex-1 h-11 px-4 rounded-full border border-border text-foreground bg-surface placeholder:text-muted"
        />
        <button
          type="button"
          onClick={addValue}
          title="Adicionar"
          aria-label="Adicionar"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-accent text-white hover:bg-accent-dark transition shrink-0"
        >
          <Plus size={18} />
        </button>
      </div>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="flex items-center gap-1 bg-surface-soft border border-border text-foreground text-sm rounded-full pl-3 pr-1 py-1"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(index)}
                title="Remover"
                aria-label={`Remover ${value}`}
                className="text-muted hover:text-danger transition p-1"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
