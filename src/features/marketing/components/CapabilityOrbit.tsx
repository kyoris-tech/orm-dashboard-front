'use client';

import { motion } from 'framer-motion';
import { GlowOrb } from './GlowOrb';
import { CAPABILITIES } from '../content';

const SATELLITE_POSITIONS = ['top-2 right-10', 'top-1/3 -right-2', 'bottom-4 left-2'];

export function CapabilityOrbit() {
  const [center, ...satellites] = CAPABILITIES;
  const CenterIcon = center.icon;

  return (
    <div className="relative hidden lg:block h-[32rem] w-full">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-150">
        <GlowOrb />
      </div>

      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-2 rounded-3xl border border-white/15 bg-[#0a0f18]/95 px-8 py-8 text-center shadow-xl will-change-transform"
        animate={{ y: -12 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      >
        <CenterIcon size={28} className="text-accent" />
        <p className="text-lg font-bold text-white">{center.title}</p>
        <p className="text-sm text-white/60">{center.caption}</p>
      </motion.div>

      {satellites.map((capability, index) => {
        const Icon = capability.icon;
        return (
          <motion.div
            key={capability.title}
            className={`absolute ${SATELLITE_POSITIONS[index]} flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-[#0a0f18]/90 px-5 py-5 text-center w-36 will-change-transform`}
            animate={{ y: index % 2 === 0 ? 12 : -12 }}
            transition={{
              duration: 4.5 + index * 0.6,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: index * 0.4,
            }}
          >
            <Icon size={20} className="text-accent" />
            <p className="text-sm font-semibold text-white">{capability.title}</p>
            <p className="text-xs text-white/50">{capability.caption}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
