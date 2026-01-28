'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InterpreterError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Interpreter page error:', error);
  }, [error]);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <section className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Something went wrong</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We encountered an error while loading the interpreter. Please try again.
        </p>
        <Button onClick={reset} variant="primary">
          Try Again
        </Button>
      </section>
    </main>
  );
}
