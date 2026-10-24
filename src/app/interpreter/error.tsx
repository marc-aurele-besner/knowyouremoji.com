'use client';

import { Button } from '@/components/ui/button';
import { captureError } from '@/lib/sentry';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InterpreterError({ error, reset }: ErrorProps) {
  useEffect(() => {
    captureError(error, { page: 'interpreter' });
  }, [error]);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <section
        role="alert"
        className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-card-border px-6 py-12 text-center"
      >
        <span className="text-[40px] leading-none" aria-hidden="true">
          ⚠️
        </span>
        <h1 className="text-[17px] font-semibold text-foreground">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          We encountered an error while loading the interpreter. Please try again.
        </p>
        <Button onClick={reset} variant="primary" className="mt-2">
          Try Again
        </Button>
      </section>
    </main>
  );
}
