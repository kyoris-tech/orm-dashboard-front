'use client';

import { useState } from 'react';
import { GraduationCap, HatGlasses, Languages, Lightbulb, MapPin } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterButton } from './FilterButton';
import type { CandidateFiltersState } from '../types';

export interface FiltersBarProps {
  filters: CandidateFiltersState;
  appliedFilters: CandidateFiltersState;
  search: string;
  onFilterChange: (key: keyof CandidateFiltersState, value: string) => void;
  onApplyFilter: (key: keyof CandidateFiltersState) => void;
  onClearFilter: (key: keyof CandidateFiltersState) => void;
  onSearchChange: (value: string) => void;
}

const FILTER_CONFIGS = [
  { key: 'skills', label: 'Habilidades', icon: Lightbulb },
  { key: 'title', label: 'Cargo', icon: HatGlasses },
  { key: 'degree', label: 'Escolaridade', icon: GraduationCap },
  { key: 'city', label: 'Localidade', icon: MapPin },
  { key: 'languages', label: 'Idiomas', icon: Languages },
] as const;

export function FiltersBar({ filters, appliedFilters, search, onFilterChange, onApplyFilter, onClearFilter, onSearchChange }: FiltersBarProps) {
  const [activeFilter, setActiveFilter] = useState<keyof CandidateFiltersState | null>(null);

  return (
    <div className="flex flex-col items-center w-full gap-4 mb-6">
      <SearchInput value={search} onChange={onSearchChange} placeholder="Buscar: Nome, e-mail ou Cargo" />

      <div className="flex justify-center gap-3 flex-wrap relative z-50">
        {FILTER_CONFIGS.map(({ key, label, icon: Icon }) => (
          <FilterButton
            key={key}
            label={label}
            icon={<Icon size={20} />}
            isActive={activeFilter === key}
            isApplied={appliedFilters[key].trim() !== ''}
            value={filters[key]}
            onClick={() => setActiveFilter((current) => (current === key ? null : key))}
            onChange={(value) => onFilterChange(key, value)}
            onApply={() => {
              onApplyFilter(key);
              setActiveFilter(null);
            }}
            onClear={() => {
              onClearFilter(key);
              setActiveFilter(null);
            }}
            onClose={() => setActiveFilter(null)}
          />
        ))}
      </div>
    </div>
  );
}
