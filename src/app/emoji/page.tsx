import Link from 'next/link';
import type { Metadata } from 'next';
import { getEmojiSummaries, getEmojiCount, getAllCategoryInfo } from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Generate metadata for the emoji browse page
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const emojiCount = getEmojiCount();
  const pageUrl = `${env.appUrl}/emoji`;
  const title = `Browse All ${emojiCount} Emojis - ${env.appName}`;
  const description = `Explore ${emojiCount} emoji meanings with context-aware interpretations. Understand what emojis really mean in texts, social media, and everyday communication.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: env.appName,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * Emoji browse page - displays all emojis organized by category
 */
export default function EmojiBrowsePage() {
  const emojiSummaries = getEmojiSummaries();
  const emojiCount = getEmojiCount();
  const categories = getAllCategoryInfo();

  // Group emojis by category
  const emojisByCategory = categories.map((category) => ({
    ...category,
    emojis: emojiSummaries.filter((emoji) => emoji.category === category.slug),
  }));

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Browse All Emojis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore {emojiCount} emoji meanings with context-aware interpretations
          </p>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-8 border-b dark:border-gray-800 sticky top-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <a
                key={category.slug}
                href={`#${category.slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 transition-colors"
              >
                {category.displayName} ({category.emojiCount})
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Emojis by Category */}
      {emojisByCategory.map((category) => (
        <section
          key={category.slug}
          id={category.slug}
          className="py-12 border-b dark:border-gray-800 last:border-b-0"
        >
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {category.displayName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {category.emojiCount} emojis
                </p>
              </div>
              <Link
                href={`/emoji/category/${category.slug}`}
                className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 text-sm font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {category.emojis.map((emoji) => (
                <Link
                  key={emoji.slug}
                  href={`/emoji/${emoji.slug}`}
                  className="block"
                  aria-label={emoji.name}
                >
                  <Card className="text-center hover:shadow-lg hover:scale-105 hover:border-amber-500 transition-all duration-200">
                    <CardContent className="py-4 px-2">
                      <span className="text-4xl block mb-1">{emoji.character}</span>
                      <p className="font-medium text-gray-900 dark:text-white text-xs truncate">
                        {emoji.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
