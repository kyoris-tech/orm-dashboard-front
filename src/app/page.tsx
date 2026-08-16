import type { Metadata } from 'next';
import { LandingView } from '@/features/marketing/components/LandingView';

export const metadata: Metadata = {
  title: 'Orm Intelligence',
};

export default function RootPage() {
  return <LandingView />;
}
