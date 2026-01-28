import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * 404 page for non-existent emoji slugs
 * Displays a friendly message and navigation options
 */
export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-2xl text-center">
      {/* Confused emoji */}
      <div className="text-6xl md:text-8xl mb-6" role="img" aria-label="Confused face">
        🤷
      </div>

      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Emoji Not Found
      </h1>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        We couldn&apos;t find the emoji you&apos;re looking for. It might have been removed or the
        URL might be incorrect.
      </p>

      {/* Navigation options */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="primary" size="lg">
          <Link href="/">Browse All Emojis</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/interpreter">Try the Interpreter</Link>
        </Button>
      </div>

      {/* Additional help text */}
      <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
        Looking for a specific emoji? Try using our search or the{' '}
        <Link
          href="/interpreter"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          interpreter tool
        </Link>{' '}
        to decode any emoji message.
      </p>
    </main>
  );
}
