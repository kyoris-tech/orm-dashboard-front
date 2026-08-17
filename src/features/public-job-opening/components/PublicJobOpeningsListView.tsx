'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { CONTRACT_TYPE_OPTIONS } from '@/features/job-openings/labels';
import { usePublicJobOpeningsQuery } from '../hooks/use-public-job-openings-query';
import { PublicJobOpeningCard } from './PublicJobOpeningCard';

const ALL_CONTRACT_TYPES_VALUE = '';

export function PublicJobOpeningsListView() {
  const jobOpeningsQuery = usePublicJobOpeningsQuery();

  const [titleQuery, setTitleQuery] = useState('');
  const [skillQuery, setSkillQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [contractType, setContractType] = useState(ALL_CONTRACT_TYPES_VALUE);

  const contractTypeOptions = useMemo(
    () => [{ value: ALL_CONTRACT_TYPES_VALUE, label: 'Todas as modalidades' }, ...CONTRACT_TYPE_OPTIONS],
    [],
  );

  const data = useMemo(() => {
    const normalizedTitle = titleQuery.trim().toLowerCase();
    const normalizedSkill = skillQuery.trim().toLowerCase();

    return (jobOpeningsQuery.data ?? []).filter((jobOpening) => {
      const matchesTitle = normalizedTitle === '' || jobOpening.title.toLowerCase().includes(normalizedTitle);
      const matchesRemote = !remoteOnly || jobOpening.workModel === 'REMOTE';
      const matchesContractType = contractType === ALL_CONTRACT_TYPES_VALUE || jobOpening.contractType === contractType;
      const matchesSkill =
        normalizedSkill === '' ||
        jobOpening.requirements.some((requirement) => requirement.toLowerCase().includes(normalizedSkill));

      return matchesTitle && matchesRemote && matchesContractType && matchesSkill;
    });
  }, [jobOpeningsQuery.data, titleQuery, skillQuery, remoteOnly, contractType]);

  return (
    <div className="w-full max-w-6xl mx-auto md:p-6 p-4 flex flex-col items-center self-start">
      <h1 className="text-2xl font-bold text-foreground text-center mb-2">Vagas abertas</h1>
      <p className="text-muted text-sm text-center mb-8">Selecione uma vaga para ver os detalhes e enviar seu currículo.</p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted pl-1">Nome da vaga</label>
          <SearchInput value={titleQuery} onChange={setTitleQuery} placeholder="Ex: Desenvolvedor" className="max-w-none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted pl-1">Habilidades</label>
          <SearchInput value={skillQuery} onChange={setSkillQuery} placeholder="Ex: React, Excel" className="max-w-none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted pl-1">Modalidade</label>
          <Select
            options={contractTypeOptions}
            value={contractType}
            onChange={(event) => setContractType(event.target.value)}
            className="!h-[60px]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted pl-1">Trabalho remoto</label>
          <label className="flex items-center gap-2 px-4 h-[60px] rounded-full border border-border bg-surface cursor-pointer">
            <Checkbox checked={remoteOnly} onChange={(event) => setRemoteOnly(event.target.checked)} />
            <span className="text-sm text-foreground">Somente vagas remotas</span>
          </label>
        </div>
      </div>

      {jobOpeningsQuery.isLoading && (
        <div className="flex items-center justify-center w-full py-16">
          <Loader2 className="animate-spin text-accent" size={28} />
        </div>
      )}

      {jobOpeningsQuery.isError && <p className="text-danger text-sm text-center py-16">Não foi possível carregar as vagas.</p>}

      {!jobOpeningsQuery.isLoading && !jobOpeningsQuery.isError && data.length === 0 && (
        <p className="text-muted text-sm text-center py-16">
          {(jobOpeningsQuery.data ?? []).length === 0 ? 'Nenhuma vaga aberta no momento.' : 'Nenhuma vaga encontrada para esses filtros.'}
        </p>
      )}

      {data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {data.map((jobOpening) => (
            <PublicJobOpeningCard key={jobOpening.publicCode} jobOpening={jobOpening} />
          ))}
        </div>
      )}
    </div>
  );
}
