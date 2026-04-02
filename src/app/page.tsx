import type { Metadata } from 'next';
import { getEmojiSummaries } from '@/lib/emoji-data';
import { getComboSummaries } from '@/lib/combo-data';
import { getPopularEmojiSummariesForHome } from '@/lib/emoji-popularity';
import { getEnv } from '@/lib/env';
import { HomePageContent } from '@/components/home/home-page-content';

const defaultDescription =
  'Discover what emojis actually mean in real conversations. Context-aware interpretations, generational differences, platform variations, and an AI interpreter for decoding emoji messages.';

/**
 * Generate metadata for the homepage including canonical URL
 * Prevents duplicate content issues with canonical link tags
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/`;

  return {
    title: `${env.appName} - Decode What Emojis Really Mean`,
    description: defaultDescription,
    keywords: [
      'emoji meaning',
      'emoji interpreter',
      'what does emoji mean',
      'emoji decoder',
      'emoji translator',
      'emoji dictionary',
      'emoji context',
      'gen z emoji',
      'millennial emoji',
      'emoji slang',
      'text message emoji',
      'emoji explanation',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: env.appName,
      title: `${env.appName} - Decode What Emojis Really Mean`,
      description: defaultDescription,
      images: [
        {
          url: `${env.appUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${env.appName} - Decode What Emojis Really Mean`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${env.appName} - Decode What Emojis Really Mean`,
      description: defaultDescription,
      images: [`${env.appUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Homepage for KnowYourEmoji.com
 *
 * Popular emojis are ranked by Neon-backed page view counts when `DATABASE_URL` is set.
 */
export default async function HomePage() {
  const allSummaries = getEmojiSummaries();
  const emojiSummaries = await getPopularEmojiSummariesForHome(12, allSummaries);
  const comboSummaries = getComboSummaries().slice(0, 8);

  return (
    <HomePageContent emojiSummaries={emojiSummaries} comboSummaries={comboSummaries} />
  );
}
