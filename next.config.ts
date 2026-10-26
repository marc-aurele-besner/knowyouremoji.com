import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

/** The five Fitzpatrick tones, in swatch order. */
const SKIN_TONES = ['light', 'medium-light', 'medium', 'medium-dark', 'dark'] as const;

/**
 * Emoji pages that were removed because another page already covered the same
 * glyph, and now point at the page that took over.
 *
 * The catalog used to publish several slugs for one drawing — a raised back of
 * hand under two names, a person swimming under three, and a set of tone
 * variants that were filed under a family whose base page showed a different
 * emoji altogether. Every one of those pairs was a second page saying the
 * same thing, so the duplicates were dropped and their addresses redirected.
 */
const EMOJI_REDIRECTS: Array<{ source: string; destination: string }> = [
  // 🤚 was published twice, as `raised-back-hand` and `raised-back-of-hand`.
  { source: '/emoji/raised-back-of-hand', destination: '/emoji/raised-back-hand' },
  // 👵 was published twice, as `older-woman` and `old-woman`.
  { source: '/emoji/old-woman', destination: '/emoji/older-woman' },
  // 🤲 lives on `palms-up-together`; `palms-together` was the second copy.
  { source: '/emoji/palms-together', destination: '/emoji/palms-up-together' },
  { source: '/emoji/backhand-up', destination: '/emoji/palms-up-together' },
  // 🖐️ lives on `hand-with-fingers-splayed`.
  { source: '/emoji/stop-hand', destination: '/emoji/hand-with-fingers-splayed' },
  // 🏊 lives on `person-swimming`.
  { source: '/emoji/swimmer', destination: '/emoji/person-swimming' },
  { source: '/emoji/swimming', destination: '/emoji/person-swimming' },
  // 🚴 lives on `person-biking`.
  { source: '/emoji/bicyclist', destination: '/emoji/person-biking' },
  ...SKIN_TONES.flatMap((tone) => [
    {
      source: `/emoji/backhand-up-${tone}`,
      destination: `/emoji/hand-with-fingers-splayed-${tone}`,
    },
    { source: `/emoji/stop-hand-${tone}`, destination: `/emoji/raised-hand-${tone}` },
    { source: `/emoji/palms-together-${tone}`, destination: '/emoji/palms-up-together' },
    { source: `/emoji/swimmer-${tone}`, destination: `/emoji/person-swimming-${tone}` },
    { source: `/emoji/bicyclist-${tone}`, destination: `/emoji/person-biking-${tone}` },
  ]),
];

const nextConfig: NextConfig = {
  // Bundle optimization: Enable modular imports for large libraries
  modularizeImports: {
    // Optimize Radix UI imports - import only what's used
    '@radix-ui/react-dialog': {
      transform: '@radix-ui/react-dialog',
    },
    '@radix-ui/react-select': {
      transform: '@radix-ui/react-select',
    },
    '@radix-ui/react-tooltip': {
      transform: '@radix-ui/react-tooltip',
    },
    '@radix-ui/react-collapsible': {
      transform: '@radix-ui/react-collapsible',
    },
    '@radix-ui/react-toast': {
      transform: '@radix-ui/react-toast',
    },
  },

  // Fix Turbopack workspace root detection (prevents resolving from wrong lockfile)
  turbopack: {
    root: process.cwd(),
  },

  // Experimental optimizations for better bundle splitting
  experimental: {
    // Optimize package imports for better tree-shaking
    optimizePackageImports: ['@radix-ui/react-icons', 'posthog-js'],
  },

  // Pages that were removed as duplicates now point at the page that replaced them.
  async redirects() {
    return EMOJI_REDIRECTS.map(({ source, destination }) => ({
      source,
      destination,
      permanent: true,
    }));
  },

  images: {
    // Enable modern image formats for better compression
    formats: ['image/avif', 'image/webp'],

    // Remote patterns for external emoji images (CDNs)
    remotePatterns: [
      // Emojipedia - Common source for emoji images
      {
        protocol: 'https',
        hostname: 'emojipedia-us.s3.amazonaws.com',
        pathname: '/thumbs/**',
      },
      {
        protocol: 'https',
        hostname: 'emojipedia-us.s3.dualstack.us-west-1.amazonaws.com',
        pathname: '/thumbs/**',
      },
      // Unicode.org emoji chart images
      {
        protocol: 'https',
        hostname: 'unicode.org',
        pathname: '/emoji/**',
      },
      // Twemoji CDN (Twitter emoji)
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/gh/twitter/twemoji@latest/**',
      },
      {
        protocol: 'https',
        hostname: 'twemoji.maxcdn.com',
        pathname: '/**',
      },
      // Google Noto Emoji
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
        pathname: '/s/e/notoemoji/**',
      },
      // OpenMoji
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/npm/openmoji@latest/**',
      },
    ],

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Image sizes for the `sizes` property
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

// Sentry configuration options
const sentryBuildOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Hide source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

export default withSentryConfig(nextConfig, sentryBuildOptions);
