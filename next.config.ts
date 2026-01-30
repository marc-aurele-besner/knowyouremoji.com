import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
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
