'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { CompaniesView } from '../companies/components/CompaniesView';
import { UsersView } from '../users/components/UsersView';
import { AdminMetricsView } from '../metrics/components/AdminMetricsView';
import { AuditLogView } from '../audit/components/AuditLogView';
import { PlansView } from '../plans/components/PlansView';
import { useAdminSection } from './AdminToggle';

export function AdminView() {
  const [activeSection] = useAdminSection();

  return (
    <PageContainer className="pt-6">
      {activeSection === 'companies' && (
        <section className="w-full max-w-6xl mx-auto">
          <CompaniesView />
        </section>
      )}

      {activeSection === 'users' && (
        <section className="w-full max-w-6xl mx-auto">
          <UsersView />
        </section>
      )}

      {activeSection === 'metrics' && (
        <section className="w-full max-w-6xl mx-auto">
          <AdminMetricsView />
        </section>
      )}

      {activeSection === 'audit' && (
        <section className="w-full max-w-6xl mx-auto">
          <AuditLogView />
        </section>
      )}

      {activeSection === 'plans' && (
        <section className="w-full max-w-6xl mx-auto">
          <PlansView />
        </section>
      )}
    </PageContainer>
  );
}
