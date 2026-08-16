'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface GlowOrbProps {
  className?: string;
}

export function GlowOrb({ className }: GlowOrbProps) {
  return (
    <div className={cn('relative h-64 w-64 md:h-80 md:w-80', className)}>
      <motion.div
        className="absolute inset-0 rounded-full bg-accent blur-[90px] opacity-70 will-change-transform"
        animate={{ x: 24, y: -18 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-8 rounded-full bg-accent-dark blur-[70px] opacity-60 will-change-transform"
        animate={{ x: -16, y: 14 }}
        transition={{ duration: 7, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 0.5 }}
      />
    </div>
  );
}
