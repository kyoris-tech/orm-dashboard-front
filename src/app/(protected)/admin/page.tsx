import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { AdminView } from '@/features/admin/components/AdminView';

export const metadata: Metadata = {
  title: 'Administração · Orm',
  description: 'Gerencie empresas, usuários, planos e auditoria da plataforma Orm Intelligence.',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getSessionUser();

  if (user?.role !== 'admin') {
    redirect('/home');
  }

  return <AdminView />;
}
