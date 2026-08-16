import type { Metadata } from 'next';
import { PublicJobOpeningsListView } from '@/features/public-job-opening/components/PublicJobOpeningsListView';

export const metadata: Metadata = {
  title: 'Vagas abertas · Orm',
};

export default function PublicJobOpeningsPage() {
  return <PublicJobOpeningsListView />;
}
