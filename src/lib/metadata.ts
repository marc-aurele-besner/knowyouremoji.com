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

/**
 * Default meta description for the site.
 *
 * Exported so the root layout can reuse the exact same wording in the
 * site-wide `Organization` JSON-LD, keeping the machine-readable
 * description in sync with the `<meta name="description">` tag.
 */
export const DEFAULT_DESCRIPTION =
  'Discover what emojis really mean in real conversations: context, generational and platform differences, plus an AI interpreter that decodes your messages.';

/**
 * Path of the default social card (og:image / twitter:image): a static
 * 1200 × 630 PNG in `public/`, served as-is with no server-side rendering.
 */
export const DEFAULT_OG_IMAGE_PATH = '/og-image.png';
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

/**
 * Alt text for the default social card.
 *
 * Describes the card rather than repeating the page title, because the
 * same image is reused across every hub page.
 */
export const DEFAULT_OG_IMAGE_ALT = 'KnowYourEmoji — what emojis really mean in context';

/**
 * Options for {@link buildSocialMetadata}.
 */
export interface SocialMetadataOptions {
  /** Title of the social card. */
  title: string;
  /** Description of the social card. */
  description: string;
  /** Absolute URL of the page the card links to. */
  url: string;
  /** Site name, used as the card's `site_name`. */
  siteName: string;
  /** Open Graph type. Defaults to `website`. */
  type?: 'website' | 'article';
  /** Alt text for the social image. Defaults to the site default. */
  imageAlt?: string;
}

/**
 * Build the Open Graph + Twitter card payload for a page that uses the
 * site's default social image.
 *
 * Why this exists: Next.js *replaces* the `openGraph` object inherited from
 * the root layout rather than deep-merging it, so a page that declares
 * `openGraph: { title, description }` without `images` silently drops the
 * social card entirely — the page then shares as a text-only link. Every
 * hub page hit that trap, and `twitter: { card: 'summary' }` made it worse
 * by dropping the large image as well.
 *
 * Routing every hub page through one helper means a new page gets a
 * complete card by default, and the default image stays in one place.
 */
export function buildSocialMetadata(options: SocialMetadataOptions) {
  const { title, description, url, siteName, type = 'website' } = options;
  const imageAlt = options.imageAlt ?? DEFAULT_OG_IMAGE_ALT;

  return {
    openGraph: {
      type,
      locale: 'en_US',
      url,
      siteName,
      title,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE_PATH,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE_PATH,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: imageAlt,
        },
      ],
    },
  };
}

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
    description: DEFAULT_DESCRIPTION,
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
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      ],
      apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: siteName,
      title: defaultTitle,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: DEFAULT_OG_IMAGE_PATH,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: defaultTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: DEFAULT_OG_IMAGE_PATH,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: defaultTitle,
        },
      ],
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
    other: {
      'google-adsense-account': 'ca-pub-4731086750813339',
    },
  };
}

/**
 * Default site metadata for the root layout
 * Pre-generated at build time using current environment values
 */
export const siteMetadata: Metadata = createSiteMetadata();
