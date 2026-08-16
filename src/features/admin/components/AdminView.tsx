'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { CompaniesView } from '../companies/components/CompaniesView';
import { UsersView } from '../users/components/UsersView';
import { AdminMetricsView } from '../metrics/components/AdminMetricsView';
import { AuditLogView } from '../audit/components/AuditLogView';
import { PlansView } from '../plans/components/PlansView';
import { AdminToggle, type AdminSection } from './AdminToggle';

export function AdminView() {
  const [activeSection, setActiveSection] = useState<AdminSection>('companies');

  return (
    <PageContainer>
      <AdminToggle active={activeSection} onChange={setActiveSection} />

      {activeSection === 'companies' && (
        <section className="mt-10 w-full max-w-6xl mx-auto">
          <CompaniesView />
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

      {activeSection === 'plans' && (
        <section className="mt-10 w-full max-w-6xl mx-auto">
          <PlansView />
        </section>
      )}
    </PageContainer>
  );
}
