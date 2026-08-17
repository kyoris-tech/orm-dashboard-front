import type { Metadata } from 'next';
import { backendClient } from '@/lib/http/backend-client';
import { PublicJobOpeningView } from '@/features/public-job-opening/components/PublicJobOpeningView';
import { CONTRACT_TYPE_LABELS, WORK_MODEL_LABELS } from '@/features/job-openings/labels';
import type { PublicJobOpening } from '@/types/public-job-opening';

async function fetchJobOpening(code: string): Promise<PublicJobOpening | null> {
  try {
    const { data } = await backendClient.get<PublicJobOpening>(`/public/job-openings/${code}`);
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }): Promise<Metadata> {
  const { codigo } = await params;
  const jobOpening = await fetchJobOpening(codigo);

  if (!jobOpening) {
    return {
      title: 'Vaga não encontrada · Orm',
      robots: { index: false, follow: false },
    };
  }

  const title = `${jobOpening.title} na ${jobOpening.companyName} · Orm`;
  const description = `Vaga de ${jobOpening.title} na ${jobOpening.companyName}: ${WORK_MODEL_LABELS[jobOpening.workModel]}, ${CONTRACT_TYPE_LABELS[jobOpening.contractType]}. Candidate-se enviando seu currículo pela Orm Intelligence.`;
  const isIndexable = jobOpening.status === 'OPEN';

  return {
    title,
    description,
    robots: isIndexable ? undefined : { index: false, follow: false },
    alternates: {
      canonical: `/vagas/${codigo}`,
    },
    openGraph: {
      title,
      description,
      url: `/vagas/${codigo}`,
      type: 'website',
    },
  };
}

export default async function PublicJobOpeningPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;

  return <PublicJobOpeningView code={codigo} />;
}
