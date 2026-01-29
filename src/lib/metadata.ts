import type { Metadata } from 'next';
import { getEnv } from './env';

/**
 * Site metadata configuration for KnowYourEmoji
 *
 * This module provides the default metadata configuration for the site,
 * including Open Graph tags, Twitter cards, and SEO-related metadata.
 */

/**
 * Get the site URL from environment, with optional override for testing
 */
export function getSiteUrl(): string {
  return getEnv().appUrl;
}

/**
 * Get the site name from environment, with optional override for testing
 */
export function getSiteName(): string {
  return getEnv().appName;
}

const defaultDescription =
  'Discover what emojis actually mean in real conversations. Context-aware interpretations, generational differences, platform variations, and an AI interpreter for decoding emoji messages.';

/**
 * Generate the default site metadata for the root layout
 * Uses a function to ensure environment variables are read fresh
 */
export function createSiteMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const siteName = getSiteName();
  const defaultTitle = `${siteName} - Decode What Emojis Really Mean`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description: defaultDescription,
    keywords: [
      'emoji meaning',
      'emoji interpreter',
      'what does emoji mean',
      'emoji decoder',
      'emoji translator',
      'emoji guide',
      'emoji dictionary',
      'emoji context',
      'gen z emoji',
      'millennial emoji',
      'emoji slang',
      'text message emoji',
      'emoji explanation',
    ],
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    publisher: siteName,
    category: 'technology',
    manifest: '/site.webmanifest',
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: siteName,
      title: defaultTitle,
      description: defaultDescription,
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: defaultTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: defaultDescription,
      images: [`${siteUrl}/og-image.png`],
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
    alternates: {
      canonical: siteUrl,
    },
  };
}

/**
 * Default site metadata for the root layout
 * Pre-generated at build time using current environment values
 */
export const siteMetadata: Metadata = createSiteMetadata();
