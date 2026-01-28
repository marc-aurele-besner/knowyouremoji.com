import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Not found page for invalid categories
 */
export default function CategoryNotFound() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
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
