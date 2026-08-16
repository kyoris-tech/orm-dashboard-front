'use client';

import { memo } from 'react';
import { motion, type Variants } from 'framer-motion';

export interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const variants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

function FadeInComponent({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div initial="hidden" animate="visible" variants={variants} transition={{ duration: 0.4, delay }} className={className}>
      {children}
    </motion.div>
  );
}

export const FadeIn = memo(FadeInComponent);
