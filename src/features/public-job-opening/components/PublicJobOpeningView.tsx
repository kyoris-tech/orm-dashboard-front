'use client';

import { CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CONTRACT_TYPE_LABELS, JOB_OPENING_STATUS_LABELS, JOB_OPENING_STATUS_TONES, WORK_MODEL_LABELS } from '@/features/job-openings/labels';
import { usePublicJobOpeningQuery } from '../hooks/use-public-job-opening-query';
import { PublicApplyArea } from './PublicApplyArea';

const APPLICATION_TIPS = [
  'Mantenha seu currículo atualizado.',
  'Utilize um e-mail profissional.',
  'Inclua LinkedIn ou portfólio se necessário.',
  'Liste tecnologias e ferramentas utilizadas.',
  'Evite imagens excessivas e layouts muito complexos no currículo.',
];

export interface PublicJobOpeningViewProps {
  code: string;
}

export function PublicJobOpeningView({ code }: PublicJobOpeningViewProps) {
  const jobOpeningQuery = usePublicJobOpeningQuery(code);
  const jobOpening = jobOpeningQuery.data;
  const isOpenForApplications = jobOpening?.status === 'OPEN';

  if (jobOpeningQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh] w-full">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (jobOpeningQuery.isError || !jobOpening) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] w-full text-center gap-2">
        <h1 className="text-2xl font-bold text-foreground">Vaga não encontrada</h1>
        <p className="text-muted">Este link pode estar incorreto ou a vaga não existe mais.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto md:p-6 p-4 flex flex-col md:flex-row gap-8">
      <div className="md:w-1/2 w-full bg-surface-soft border border-border rounded-xl p-6 text-left h-fit">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-2xl font-bold text-foreground">Informações da Vaga</h2>
          <Badge tone={JOB_OPENING_STATUS_TONES[jobOpening.status]}>{JOB_OPENING_STATUS_LABELS[jobOpening.status]}</Badge>
        </div>

        <div className="space-y-5 text-sm">
          <div>
            <p className="text-muted">Título da vaga</p>
            <p className="font-semibold text-lg text-foreground">{jobOpening.title}</p>
          </div>

          <div>
            <p className="text-muted">Empresa</p>
            <p className="font-medium text-foreground">{jobOpening.companyName}</p>
          </div>

          <div>
            <p className="text-muted">Modelo</p>
            <p className="text-foreground">{WORK_MODEL_LABELS[jobOpening.workModel]}</p>
          </div>

          {jobOpening.requirements.length > 0 && (
            <div>
              <p className="text-muted mb-1">Requisitos principais</p>
              <ul className="list-disc list-inside space-y-1 text-foreground">
                {jobOpening.requirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          {jobOpening.differentials.length > 0 && (
            <div>
              <p className="text-muted mb-1">Diferenciais</p>
              <ul className="list-disc list-inside space-y-1 text-foreground">
                {jobOpening.differentials.map((differential) => (
                  <li key={differential}>{differential}</li>
                ))}
              </ul>
            </div>
          )}

          {jobOpening.benefits.length > 0 && (
            <div>
              <p className="text-muted mb-1">Benefícios</p>
              <ul className="list-disc list-inside space-y-1 text-foreground">
                {jobOpening.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {jobOpening.salaryRange && (
            <div>
              <p className="text-muted">Faixa salarial</p>
              <p className="text-foreground">{jobOpening.salaryRange}</p>
            </div>
          )}

          <div>
            <p className="text-muted">Tipo de contrato</p>
            <p className="text-foreground">{CONTRACT_TYPE_LABELS[jobOpening.contractType]}</p>
          </div>
        </div>
      </div>

      <div className="md:w-1/2 w-full text-left">
        {isOpenForApplications ? (
          <>
            <h1 className="md:text-3xl text-2xl font-bold text-center mb-4 text-foreground">Envie seu currículo</h1>
            <p className="text-center text-muted text-sm mb-8">Formatos aceitos: PDF e Word — até 25MB.</p>

            <div className="bg-surface-soft border border-border rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 text-center text-foreground">Dicas para melhorar sua análise na plataforma</h2>

              <ul className="space-y-3 text-sm text-foreground">
                {APPLICATION_TIPS.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-accent mt-0.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <PublicApplyArea code={code} />
          </>
        ) : (
          <div className="bg-surface-soft border border-border rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Vaga encerrada</h2>
            <p className="text-muted text-sm">Esta vaga não está mais recebendo candidaturas no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
