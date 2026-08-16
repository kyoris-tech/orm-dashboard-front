'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SegmentedControlOption<T extends string> {
  key: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[];
  active: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({ options, active, onChange, className }: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeButton = buttonRefs.current[active];
    const container = containerRef.current;

    if (!activeButton || !container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    setSliderStyle({
      left: buttonRect.left - containerRect.left,
      width: buttonRect.width,
    });
  }, [active]);

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div ref={containerRef} className="relative inline-flex items-center bg-surface-soft border-2 border-border rounded-full p-1 gap-2">
        <div
          className="absolute top-1 bottom-1 rounded-full bg-foreground transition-all duration-300 ease-in-out"
          style={{ left: `${sliderStyle.left}px`, width: `${sliderStyle.width}px` }}
        />

        {options.map((option) => {
          const isActive = active === option.key;

          return (
            <button
              key={option.key}
              ref={(element) => {
                buttonRefs.current[option.key] = element;
              }}
              onClick={() => onChange(option.key)}
              className={cn(
                'relative z-10 px-5 py-2 rounded-full md:text-base text-xs font-semibold whitespace-nowrap transition-colors duration-300',
                isActive ? 'text-white' : 'text-primary',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
