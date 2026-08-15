'use client';

import { useMemo, useState } from 'react';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
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

const PAGE_SIZE = 10;

export function AnalyzeSection() {
  const [draftFilters, setDraftFilters] = useState<CandidateFiltersState>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<CandidateFiltersState>(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

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
      pageSize: PAGE_SIZE,
    }),
    [appliedFilters, debouncedSearch, page],
  );

  return (
    <section className="w-full max-w-6xl mx-auto">
      <FiltersBar
        filters={draftFilters}
        appliedFilters={appliedFilters}
        search={search}
        onFilterChange={handleFilterChange}
        onApplyFilter={handleApplyFilter}
        onClearFilter={handleClearFilter}
        onSearchChange={handleSearchChange}
      />

      <CandidateTable filters={searchFilters} onPageChange={setPage} />
    </section>
  );
}
