'use client';

import { useState } from 'react';
import { ImportToggle, type HomeSection } from '@/features/resumes/components/ImportToggle';
import { UploadArea } from '@/features/resumes/components/UploadArea';
import { RecentImports } from '@/features/resumes/components/RecentImports';
import { AnalyzeSection } from '@/features/resumes/components/AnalyzeSection';
import { SelectionProcessesTable } from '@/features/selection-processes/components/SelectionProcessesTable';
import { JobOpeningsView } from '@/features/job-openings/components/JobOpeningsView';
import { PlanUsageCard } from '@/features/plan/components/PlanUsageCard';
import { PlanFeatureGate } from '@/features/plan/components/PlanFeatureGate';
import { PageContainer } from '@/components/layout/PageContainer';

export function HomeView() {
  const [activeSection, setActiveSection] = useState<HomeSection>('import');

  return (
    <PageContainer>
      <div className="w-full max-w-6xl mx-auto mb-6">
        <PlanUsageCard />
      </div>

      <ImportToggle active={activeSection} onChange={setActiveSection} />

      {activeSection === 'import' && (
        <section className="mt-10 w-full max-w-3xl">
          <UploadArea />
          <RecentImports />
        </section>
      )}

      {activeSection === 'analyze' && (
        <section className="mt-10 w-full">
          <AnalyzeSection onSelectionProcessCreated={() => setActiveSection('proccess')} />
        </section>
      )}

      {activeSection === 'proccess' && (
        <section className="mt-10 w-full max-w-6xl mx-auto">
          <PlanFeatureGate feature="selectionProcesses">
            <SelectionProcessesTable />
          </PlanFeatureGate>
        </section>
      )}

      {activeSection === 'jobOpenings' && (
        <section className="mt-10 w-full">
          <PlanFeatureGate feature="jobOpenings">
            <JobOpeningsView />
          </PlanFeatureGate>
        </section>
      )}
    </PageContainer>
  );
}
