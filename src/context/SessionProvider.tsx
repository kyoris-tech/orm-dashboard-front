'use client';

import { createContext, useContext } from 'react';
import type { SessionUser } from '@/types/auth';

const SessionContext = createContext<SessionUser | null>(null);

export interface SessionProviderProps {
  user: SessionUser | null;
  children: React.ReactNode;
}

export function SessionProvider({ user, children }: SessionProviderProps) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useSessionUser(): SessionUser | null {
  return useContext(SessionContext);
}
