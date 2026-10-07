'use client';

import { useEffect, useRef } from 'react';

interface EscapeEntry {
  close: () => void;
}

const openStack: EscapeEntry[] = [];
let isListening = false;

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || openStack.length === 0) {
    return;
  }

  openStack[openStack.length - 1].close();
}

function ensureListener() {
  if (isListening || typeof window === 'undefined') {
    return;
  }

  window.addEventListener('keydown', handleKeyDown);
  isListening = true;
}

export function useEscapeToClose(isOpen: boolean, onClose?: () => void) {
  const latestOnClose = useRef(onClose);

  useEffect(() => {
    latestOnClose.current = onClose;
  });

  const isActive = isOpen && Boolean(onClose);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    ensureListener();

    const entry: EscapeEntry = { close: () => latestOnClose.current?.() };
    openStack.push(entry);

    return () => {
      const index = openStack.indexOf(entry);

      if (index >= 0) {
        openStack.splice(index, 1);
      }
    };
  }, [isActive]);
}
