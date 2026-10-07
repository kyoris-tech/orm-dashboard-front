'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const SECTION_PARAM = 'aba';

export function useSectionParam<T extends string>(keys: readonly T[], fallback: T) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawValue = searchParams.get(SECTION_PARAM);
  const section = keys.find((key) => key === rawValue) ?? fallback;

  const setSection = useCallback(
    (next: T) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next === fallback) {
        params.delete(SECTION_PARAM);
      } else {
        params.set(SECTION_PARAM, next);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [fallback, pathname, router, searchParams],
  );

  return [section, setSection] as const;
}
