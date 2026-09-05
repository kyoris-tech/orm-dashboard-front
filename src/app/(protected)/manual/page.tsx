import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { ManualView } from '@/features/manual/components/ManualView';

export const metadata: Metadata = {
  title: 'Manual · Orm',
  description: 'Guia de uso da plataforma Orm Intelligence.',
  robots: { index: false, follow: false },
};

export default async function ManualPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  return <ManualView />;
}
