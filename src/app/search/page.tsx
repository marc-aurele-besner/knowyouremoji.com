import type { Metadata } from 'next';
import { getEmojiSummaries, getEmojiCount } from '@/lib/emoji-data';
import { getComboSummaries, getComboCount } from '@/lib/combo-data';
import { getEnv } from '@/lib/env';
import { SearchPageClient } from '@/components/search/search-page-client';

/**
 * Generate metadata for the search page
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const emojiCount = getEmojiCount();
  const comboCount = getComboCount();
  const pageUrl = `${env.appUrl}/search`;
  const title = `Search Emojis & Combos - ${env.appName}`;
  const description = `Search through ${emojiCount} emojis and ${comboCount} emoji combos. Find context-aware meanings and interpretations for any emoji or combination.`;

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
 * Search page - client-side search for emojis and combos
 */
export default function SearchPage() {
  const emojiSummaries = getEmojiSummaries();
  const comboSummaries = getComboSummaries();
  const emojiCount = getEmojiCount();
  const comboCount = getComboCount();

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Search Emojis & Combos
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find context-aware meanings for {emojiCount} emojis and {comboCount} emoji combos
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <SearchPageClient emojis={emojiSummaries} combos={comboSummaries} />
        </div>
      </section>
    </div>
  );
}
