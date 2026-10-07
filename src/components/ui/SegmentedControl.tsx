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
  compact?: boolean;
  leading?: React.ReactNode;
  joinedBelow?: boolean;
}

export function SegmentedControl<T extends string>({ options, active, onChange, className, compact, leading, joinedBelow }: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    function measure() {
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
    }

    measure();

    const container = containerRef.current;
    const observer = new ResizeObserver(measure);
    const observed = [container, ...Object.values(buttonRefs.current)];

    observed.forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, [active, compact]);

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div ref={containerRef} data-pill className={cn('relative inline-flex items-center bg-surface-soft border-2 border-border p-1 gap-2', joinedBelow ? 'rounded-[22px] rounded-bl-none' : 'rounded-full')}>
        <div
          className="absolute top-1 bottom-1 rounded-full bg-foreground transition-all duration-300 ease-in-out"
          style={{ left: `${sliderStyle.left}px`, width: `${sliderStyle.width}px` }}
        />

        {leading && <div className="relative z-10">{leading}</div>}

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
                'relative z-10 rounded-full font-semibold whitespace-nowrap transition-colors duration-300',
                compact ? 'px-4 py-1.5 text-sm' : 'px-5 py-2 md:text-base text-xs',
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
