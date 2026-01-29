'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useEmojiSearch } from '@/hooks/use-emoji-search';
import { getEmojiSummaries } from '@/lib/emoji-data';
import type { EmojiSummary } from '@/types/emoji';

/**
 * Global 404 page with search functionality
 * Displays a friendly message and allows users to search for emojis
 */
export default function NotFound() {
  const emojis = getEmojiSummaries();
  const {
    results: filteredEmojis,
    query: searchQuery,
    setQuery,
    clearQuery,
    resultCount,
  } = useEmojiSearch({ emojis });

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
    },
    [setQuery]
  );

  const handleClearSearch = useCallback(() => {
    clearQuery();
  }, [clearQuery]);

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
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          Search for an Emoji
        </h2>

        {/* Search Input */}
        <div className="relative max-w-md mx-auto mb-6">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          >
            🔍
          </span>
          <Input
            type="search"
            role="searchbox"
            placeholder="Search emojis by name or character..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
            aria-label="Search emojis"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Result Count */}
        {searchQuery && (
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            {resultCount} emoji{resultCount !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Emoji Results Grid */}
        {filteredEmojis.length > 0 ? (
          <ul
            role="list"
            aria-label="Emoji results"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
          >
            {filteredEmojis.slice(0, 12).map((emoji: EmojiSummary) => (
              <li key={emoji.slug}>
                <Link
                  href={`/emoji/${emoji.slug}`}
                  className="flex flex-col items-center rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  aria-label={emoji.name}
                >
                  <span className="text-3xl mb-2" role="img" aria-hidden="true">
                    {emoji.character}
                  </span>
                  <span className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    {emoji.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-8">No emojis found matching your search.</p>
        )}
      </div>

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
