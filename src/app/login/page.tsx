import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Entrar · Orm',
  description: 'Acesse sua conta na Orm Intelligence.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
