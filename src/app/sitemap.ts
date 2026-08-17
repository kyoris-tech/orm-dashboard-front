import type { MetadataRoute } from 'next';
import { backendClient } from '@/lib/http/backend-client';
import type { PublicJobOpeningSummary } from '@/types/public-job-opening';

const SITE_URL = 'https://useorm.com';

async function fetchOpenJobOpenings(): Promise<PublicJobOpeningSummary[]> {
  try {
    const { data } = await backendClient.get<PublicJobOpeningSummary[]>('/public/job-openings');
    return data;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobOpenings = await fetchOpenJobOpenings();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/vagas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...jobOpenings.map((jobOpening) => ({
      url: `${SITE_URL}/vagas/${jobOpening.publicCode}`,
      lastModified: new Date(jobOpening.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
