'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { CompaniesTable } from '../companies/components/CompaniesTable';
import { UsersView } from '../users/components/UsersView';
import { AdminMetricsView } from '../metrics/components/AdminMetricsView';
import { AuditLogView } from '../audit/components/AuditLogView';
import { AdminToggle, type AdminSection } from './AdminToggle';

export function AdminView() {
  const [activeSection, setActiveSection] = useState<AdminSection>('companies');

  return (
    <PageContainer>
      <AdminToggle active={activeSection} onChange={setActiveSection} />

      {activeSection === 'companies' && (
        <section className="mt-10 w-full max-w-6xl mx-auto">
          <CompaniesTable />
        </section>
      )}

      {activeSection === 'users' && (
        <section className="mt-10 w-full max-w-6xl mx-auto">
          <UsersView />
        </section>
      )}

      {activeSection === 'metrics' && (
        <section className="mt-10 w-full max-w-6xl mx-auto">
          <AdminMetricsView />
        </section>
      )}

      {activeSection === 'audit' && (
        <section className="mt-10 w-full max-w-6xl mx-auto">
          <AuditLogView />
        </section>
      )}
    </PageContainer>
  );
}
