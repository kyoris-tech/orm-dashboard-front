'use client';

import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface FilterButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isApplied: boolean;
  value: string;
  onClick: () => void;
  onChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function FilterButton({ label, icon, isActive, isApplied, value, onClick, onChange, onApply, onClear, onClose }: FilterButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFilled = value.trim() !== '';

  useEffect(() => {
    if (!isActive) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isActive, onClose]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        }}
        className={cn(
          'flex items-center gap-[10px] px-3 py-2 text-sm border rounded-full transition-all duration-200',
          isApplied ? 'bg-accent text-white border-accent' : 'border-border text-foreground bg-transparent',
        )}
      >
        <span className="flex items-center gap-1">
          {icon}
          <span className="font-semibold">{label}</span>
        </span>
        <ChevronDown size={20} className={isApplied ? 'text-white' : 'text-accent'} />
      </button>

      {isActive && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-64 bg-surface border border-border rounded-lg shadow-lg p-3 z-50">
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={`Filtrar por ${label.toLowerCase()}...`}
            className="w-full px-3 py-2 text-sm rounded-md outline-none border border-border text-foreground bg-surface-soft transition-all focus:border-accent"
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={onApply}
              disabled={!isFilled}
              className={cn(
                'flex-1 py-2 rounded-md text-sm font-semibold transition-all',
                isFilled ? 'bg-accent text-white hover:bg-accent-dark' : 'bg-surface-soft text-muted cursor-not-allowed',
              )}
            >
              Aplicar
            </button>
            <button
              onClick={onClear}
              className="flex-1 py-2 rounded-md text-sm font-semibold border border-border text-muted hover:bg-surface-soft transition-all"
            >
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
