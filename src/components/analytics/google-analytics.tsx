'use client';

import { GoogleAnalytics as GA } from '@next/third-parties/google';
import { isTest } from '@/lib/env';

/**
 * Google Analytics wrapper component
 *
 * This component integrates Google Analytics 4 for web traffic analysis
 * and event tracking. It is disabled in test environments and when
 * no measurement ID is provided.
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Don't render analytics in test environment or if no ID is configured
  if (isTest() || !measurementId) {
    return null;
  }

  return <GA gaId={measurementId} />;
}
