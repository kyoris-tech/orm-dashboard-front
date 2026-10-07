'use client';

import { useState } from 'react';
import type { z } from 'zod';

export function useFormValidation<TSchema extends z.ZodType>(schema: TSchema, values: z.input<TSchema>) {
  const [touchedFields, setTouchedFields] = useState<ReadonlySet<string>>(new Set());
  const [wasSubmitted, setWasSubmitted] = useState(false);

  const result = schema.safeParse(values);
  const fieldErrors: Record<string, string> = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? '');

      if (!(field in fieldErrors)) {
        fieldErrors[field] = issue.message;
      }
    }
  }

  function errorFor(field: string): string | undefined {
    return wasSubmitted || touchedFields.has(field) ? fieldErrors[field] : undefined;
  }

  function touch(field: string) {
    setTouchedFields((current) => (current.has(field) ? current : new Set(current).add(field)));
  }

  function field(name: string) {
    return { error: errorFor(name), onBlur: () => touch(name) };
  }

  function submit(): z.output<TSchema> | null {
    setWasSubmitted(true);
    return result.success ? result.data : null;
  }

  function reset() {
    setTouchedFields(new Set());
    setWasSubmitted(false);
  }

  return { isValid: result.success, errorFor, touch, field, submit, reset };
}
