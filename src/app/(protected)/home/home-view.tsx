'use client';

import { useState } from 'react';
import { ImportToggle, type HomeSection } from '@/features/resumes/components/ImportToggle';
import { UploadArea } from '@/features/resumes/components/UploadArea';
import { RecentImports } from '@/features/resumes/components/RecentImports';
import { AnalyzeSection } from '@/features/resumes/components/AnalyzeSection';
import { PageContainer } from '@/components/layout/PageContainer';
import { Text } from '@/components/ui/Text';

export function HomeView() {
  const [activeSection, setActiveSection] = useState<HomeSection>('import');

  return (
    <PageContainer>
      <ImportToggle active={activeSection} onChange={setActiveSection} />

      {activeSection === 'import' && (
        <section className="mt-10 w-full max-w-3xl">
          <UploadArea />
          <RecentImports />
        </section>
      )}

      {activeSection === 'analyze' && (
        <section className="mt-10 w-full">
          <AnalyzeSection />
        </section>
      )}

      {(activeSection === 'proccess' || activeSection === 'jobOpenings') && (
        <section className="mt-10 text-center w-full">
          <Text variant="subtitle" muted>
            Estamos em construção
          </Text>
        </section>
      )}
    </PageContainer>
  );
}
