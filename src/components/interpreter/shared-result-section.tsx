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
      <section
        data-testid="interpreter-form-section"
        className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-800"
      >
        <p className="text-center text-gray-500 mb-4">
          This shared result could not be loaded. Try interpreting a message yourself!
        </p>
        <InterpreterClient />
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <SharedInterpretationView data={decoded} />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-4">Try It Yourself</h2>
        <InterpreterClient />
      </div>
    </section>
  );
}
