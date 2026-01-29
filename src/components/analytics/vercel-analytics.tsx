'use client';

import { Analytics } from '@vercel/analytics/react';
import { isTest } from '@/lib/env';

/**
 * Vercel Analytics wrapper component
 *
 * This component integrates Vercel Analytics for web traffic analysis.
 * It is disabled in test environments to prevent test pollution and
 * unnecessary network requests.
 */
export function VercelAnalytics() {
  // Don't render analytics in test environment
  if (isTest()) {
    return null;
  }

  return <Analytics />;
}
