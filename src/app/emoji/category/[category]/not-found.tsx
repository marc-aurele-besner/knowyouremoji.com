import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Not found page for invalid categories
 */
export default function CategoryNotFound() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
        Category Not Found
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        The emoji category you&apos;re looking for doesn&apos;t exist or has no emojis yet.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/emoji">Browse All Emojis</Link>
        </Button>
      </div>
    </main>
  );
}
