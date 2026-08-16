'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

const SECTION_IDS = ['topo', 'empresa', 'planos', 'sobre'];

const NAV_ANCHORS = [
  { id: 'empresa', href: '#empresa', label: 'Para Sua Empresa' },
  { id: 'planos', href: '#planos', label: 'Planos' },
  { id: 'sobre', href: '#sobre', label: 'Conheça a Orm' },
];

export function LandingNav() {
  const [activeId, setActiveId] = useState('topo');

  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible) {
          setActiveId(mostVisible.target.id);
        }
      },
      { threshold: [0.5] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const scrolled = activeId !== 'topo';

  return (
    <motion.header
      className={cn(
        'fixed top-6 left-1/2 z-50 flex items-center justify-between gap-6 rounded-full border border-white/10 px-6 py-3 text-white max-w-[92vw]',
        scrolled && 'backdrop-blur-md',
      )}
      style={{ x: '-50%' }}
      initial={false}
      animate={{
        width: scrolled ? 720 : 1180,
        backgroundColor: scrolled ? 'rgba(5,7,12,0.85)' : 'rgba(5,7,12,0)',
      }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <Link href="/" className="text-2xl font-bold tracking-tight shrink-0">
        Orm
      </Link>

      <nav className="hidden md:flex items-center gap-3">
        {NAV_ANCHORS.map((anchor) => (
          <a
            key={anchor.href}
            href={anchor.href}
            className={cn(
              'px-5 py-2 rounded-full border text-sm font-medium transition whitespace-nowrap',
              activeId === anchor.id ? 'border-accent text-accent' : 'border-white/15 text-white hover:bg-white/10',
            )}
          >
            {anchor.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/vagas"
          className="px-5 py-2 rounded-full border border-white/15 text-white text-sm font-medium hover:bg-white/10 transition whitespace-nowrap"
        >
          Vagas
        </Link>

        <Link
          href="/login"
          className="px-5 py-2 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition whitespace-nowrap"
        >
          Entrar
        </Link>
      </div>
    </motion.header>
  );
}
