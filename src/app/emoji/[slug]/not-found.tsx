import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * 404 page for non-existent emoji slugs
 * Displays a friendly message and navigation options
 */
export default function NotFound() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-20 text-center">
      {/* Confused emoji */}
      <div
        className="emoji-display mb-6 text-6xl md:text-7xl"
        role="img"
        aria-label="Confused face"
      >
        🤷
      </div>

      {/* Heading */}
      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
        Emoji Not Found
      </h1>

      {/* Description */}
      <p className="mb-8 text-lg text-muted-foreground">
        We couldn&apos;t find the emoji you&apos;re looking for. It might have been removed or the
        URL might be incorrect.
      </p>

      {/* Navigation options */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="primary" size="lg">
          <Link href="/">Browse All Emojis</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/interpreter">Try the Interpreter</Link>
        </Button>
      </div>

      {/* Additional help text */}
      <p className="mt-8 text-sm text-muted-foreground">
        Looking for a specific emoji? Try using our search or the{' '}
        <Link href="/interpreter" className="underline underline-offset-2 hover:text-foreground">
          interpreter tool
        </Link>{' '}
        to decode any emoji message.
      </p>
    </main>
  );
}
