import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionProvider } from '@/context/SessionProvider';
import { getSessionUser } from '@/lib/auth/session';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://useorm.com'),
  title: {
    default: 'Orm Intelligence',
    template: '%s',
  },
  description: 'Plataforma de recrutamento com triagem de currículos por inteligência artificial, operada pela Kyoris Tech.',
  openGraph: {
    siteName: 'Orm Intelligence',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const user = await getSessionUser();

  return (
    <html lang="pt-BR" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface-soft">
        <Providers>
          <SessionProvider user={user}>
            <Header user={user} />
            <main className="flex-1 flex justify-center items-center w-full">{children}</main>
            <Footer />
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
