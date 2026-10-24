'use client';

import { useMemo } from 'react';
import { decodeInterpretation } from '@/lib/share-encoding';
import { SharedInterpretationView } from './shared-interpretation-view';
import { InterpreterClient } from './interpreter-client';

export interface SharedResultSectionProps {
  encodedResult: string;
}

/**
 * Client component that decodes a shared interpretation result and renders it.
 * Falls back to the interpreter form if decoding fails.
 */
export function SharedResultSection({ encodedResult }: SharedResultSectionProps) {
  const decoded = useMemo(() => decodeInterpretation(encodedResult), [encodedResult]);

  if (!decoded) {
    return (
      <section data-testid="interpreter-form-section" className="space-y-4">
        <p className="rounded-xl bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
          This shared result could not be loaded. Try interpreting a message yourself!
        </p>
        <InterpreterClient />
      </section>
    );
  }

  return (
    <section className="space-y-10">
      <div className="rounded-2xl border border-card-border bg-card p-5 md:p-7">
        <SharedInterpretationView data={decoded} />
      </div>
      <div>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
          Try It Yourself
        </h2>
        <InterpreterClient />
      </div>
    </section>
  );
}
