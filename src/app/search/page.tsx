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
    <div className="container mx-auto max-w-6xl px-4 pb-16 pt-10">
      <header className="mb-7">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Search Emojis & Combos
        </h1>
        <p className="mt-2 max-w-2xl text-[17px] text-muted-foreground">
          Find context-aware meanings for {emojiCount} emojis and {comboCount} emoji combos
        </p>
      </header>

      <SearchPageClient emojis={emojiSummaries} combos={comboSummaries} />
    </div>
  );
}
