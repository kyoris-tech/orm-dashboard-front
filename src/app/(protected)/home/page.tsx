import type { Metadata } from 'next';
import { HomeView } from './home-view';

export const metadata: Metadata = {
  title: 'Início · Orm',
};

export default function HomePage() {
  return <HomeView />;
}
