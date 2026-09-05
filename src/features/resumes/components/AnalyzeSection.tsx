'use client';

import { useMemo, useState } from 'react';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { usePagination } from '@/lib/hooks/use-pagination';
import { CandidateTable } from './CandidateTable';
import { FiltersBar } from './FiltersBar';
import type { CandidateFiltersState } from '../types';

const EMPTY_FILTERS: CandidateFiltersState = {
  skills: '',
  title: '',
  degree: '',
  city: '',
  languages: '',
};

export interface AnalyzeSectionProps {
  onSelectionProcessCreated?: () => void;
}

export function AnalyzeSection({ onSelectionProcessCreated }: AnalyzeSectionProps) {
  const [draftFilters, setDraftFilters] = useState<CandidateFiltersState>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<CandidateFiltersState>(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const { page, pageSize, setPage, setPageSize } = usePagination();

  const debouncedSearch = useDebouncedValue(search, 500);

  function handleFilterChange(key: keyof CandidateFiltersState, value: string) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function handleApplyFilter(key: keyof CandidateFiltersState) {
    setAppliedFilters((current) => ({ ...current, [key]: draftFilters[key] }));
    setPage(1);
  }

  function handleClearFilter(key: keyof CandidateFiltersState) {
    setDraftFilters((current) => ({ ...current, [key]: '' }));
    setAppliedFilters((current) => ({ ...current, [key]: '' }));
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const searchFilters = useMemo(
    () => ({
      ...appliedFilters,
      query: debouncedSearch,
      page,
      pageSize,
    }),
    [appliedFilters, debouncedSearch, page, pageSize],
  );

  return (
    <section className="w-full max-w-7xl mx-auto">
      <FiltersBar
        filters={draftFilters}
        appliedFilters={appliedFilters}
        search={search}
        onFilterChange={handleFilterChange}
        onApplyFilter={handleApplyFilter}
        onClearFilter={handleClearFilter}
        onSearchChange={handleSearchChange}
      />

      <CandidateTable
        filters={searchFilters}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSelectionProcessCreated={onSelectionProcessCreated}
      />
    </section>
  );
}
