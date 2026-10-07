'use client';

import { useHomeSection } from '@/features/resumes/components/ImportToggle';
import { UploadArea } from '@/features/resumes/components/UploadArea';
import { RecentImports } from '@/features/resumes/components/RecentImports';
import { AnalyzeSection } from '@/features/resumes/components/AnalyzeSection';
import { SelectionProcessesTable } from '@/features/selection-processes/components/SelectionProcessesTable';
import { JobOpeningsView } from '@/features/job-openings/components/JobOpeningsView';
import { PlanFeatureGate } from '@/features/plan/components/PlanFeatureGate';
import { PageContainer } from '@/components/layout/PageContainer';

export function HomeView() {
  const [activeSection, setActiveSection] = useHomeSection();

  return (
    <PageContainer className="pt-2">
      {activeSection === 'import' && (
        <section className="w-full max-w-3xl">
          <UploadArea />
          <RecentImports />
        </section>
      )}

      {activeSection === 'analyze' && (
        <section className="w-full">
          <AnalyzeSection onSelectionProcessCreated={() => setActiveSection('proccess')} />
        </section>
      )}

      {activeSection === 'proccess' && (
        <section className="w-full max-w-6xl mx-auto">
          <PlanFeatureGate feature="selectionProcesses">
            <SelectionProcessesTable />
          </PlanFeatureGate>
        </section>
      )}

      {activeSection === 'jobOpenings' && (
        <section className="w-full">
          <PlanFeatureGate feature="jobOpenings">
            <JobOpeningsView />
          </PlanFeatureGate>
        </section>
      )}
    </PageContainer>
  );
}
