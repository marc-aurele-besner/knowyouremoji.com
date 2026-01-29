import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NotFoundSearch } from '@/components/not-found/not-found-search';
import { getEmojiSummaries } from '@/lib/emoji-data';

/**
 * Global 404 page with search functionality
 * Displays a friendly message and allows users to search for emojis
 */
export default function NotFound() {
  const emojis = getEmojiSummaries();

  return (
    <main className="container mx-auto px-4 py-16 max-w-4xl">
      {/* 404 Hero Section */}
      <div className="text-center mb-12">
        {/* Confused emoji */}
        <div className="text-6xl md:text-8xl mb-4" role="img" aria-label="Confused face">
          🤷
        </div>

        {/* 404 Status */}
        <p className="text-6xl md:text-8xl font-bold text-gray-200 dark:text-gray-700 mb-4">404</p>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-xl mx-auto">
          The page you&apos;re looking for doesn&apos;t exist. But don&apos;t worry, you can search
          for emojis or explore our popular pages below.
        </p>

        {/* Navigation options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild variant="primary" size="lg">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/interpreter">Try the Interpreter</Link>
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <NotFoundSearch emojis={emojis} />

      {/* Popular Pages Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          Popular Pages
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/" className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <span className="text-3xl mb-2 block">🏠</span>
                <p className="font-medium text-gray-900 dark:text-white">Homepage</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Browse all emojis</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/interpreter" className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <span className="text-3xl mb-2 block">🤖</span>
                <p className="font-medium text-gray-900 dark:text-white">Interpreter</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Decode emoji messages</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/about" className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <span className="text-3xl mb-2 block">ℹ️</span>
                <p className="font-medium text-gray-900 dark:text-white">About</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Learn about us</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
