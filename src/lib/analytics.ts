/**
 * Analytics service for tracking custom events
 *
 * Provides typed functions for tracking user interactions throughout the app.
 * Sends events to both Google Analytics (via @next/third-parties/google)
 * and PostHog for comprehensive product analytics.
 */

import { sendGAEvent } from '@next/third-parties/google';
import posthog from 'posthog-js';

/**
 * Check if analytics is available (client-side only)
 */
function isAnalyticsAvailable(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Safe wrapper for sending PostHog events
 * Silently fails if PostHog is not available
 */
function safePostHogCapture(
  eventName: string,
  eventParams: Record<string, string | number | boolean>
): void {
  try {
    posthog.capture(eventName, eventParams);
  } catch {
    // Silently fail if PostHog is not loaded
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[PostHog] ${eventName}`, eventParams);
    }
  }
}

/**
 * Safe wrapper for sending GA events
 * Silently fails if analytics is not available
 */
function safeGAEvent(
  eventName: string,
  eventParams: Record<string, string | number | boolean>
): void {
  try {
    sendGAEvent('event', eventName, eventParams);
  } catch {
    // Silently fail if GA is not loaded
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[GA] ${eventName}`, eventParams);
    }
  }
}

/**
 * Safe wrapper for tracking events to all analytics providers
 * Sends events to both Google Analytics and PostHog
 * Silently fails if analytics is not available
 */
function safeTrackEvent(
  eventName: string,
  eventParams: Record<string, string | number | boolean>
): void {
  if (!isAnalyticsAvailable()) return;

  // Send to Google Analytics
  safeGAEvent(eventName, eventParams);

  // Send to PostHog
  safePostHogCapture(eventName, eventParams);
}

/**
 * Emoji-related event tracking
 */
export const emojiEvents = {
  /** Track when user views an emoji detail page */
  view: (emoji: string, slug: string, category: string) =>
    safeTrackEvent('emoji_view', { emoji, slug, category }),

  /** Track when user copies an emoji character */
  copy: (emoji: string, slug: string) => safeTrackEvent('emoji_copy', { emoji, slug }),

  /** Track when user searches for emojis */
  search: (searchTerm: string, resultCount: number) =>
    safeTrackEvent('emoji_search', { search_term: searchTerm, result_count: resultCount }),

  /** Track when user clicks a search result */
  searchResultClick: (emoji: string, slug: string, position: number) =>
    safeTrackEvent('emoji_search_result_click', { emoji, slug, position }),

  /** Track when user clicks a related emoji */
  relatedClick: (emoji: string, slug: string, sourceSlug: string) =>
    safeTrackEvent('related_emoji_click', { emoji, slug, source_slug: sourceSlug }),
};

/**
 * Combo-related event tracking
 */
export const comboEvents = {
  /** Track when user views a combo detail page */
  view: (combo: string, slug: string) => safeTrackEvent('combo_view', { combo, slug }),

  /** Track when user copies a combo */
  copy: (combo: string, slug: string) => safeTrackEvent('combo_copy', { combo, slug }),

  /** Track when user clicks a combo from a list */
  click: (combo: string, slug: string, source: string) =>
    safeTrackEvent('combo_click', { combo, slug, source }),
};

/**
 * Interpreter tool event tracking
 */
export const interpreterEvents = {
  /** Track when user submits a message for interpretation */
  submit: (messageLength: number, platform: string) =>
    safeTrackEvent('interpreter_submit', { message_length: messageLength, platform }),

  /** Track when interpretation result is displayed */
  resultView: (hasRedFlags: boolean, passiveAggressionScore: number) =>
    safeTrackEvent('interpreter_result_view', {
      has_red_flags: hasRedFlags,
      passive_aggression_score: passiveAggressionScore,
    }),

  /** Track when user selects a platform filter */
  platformSelect: (platform: string) => safeTrackEvent('interpreter_platform_select', { platform }),

  /** Track when user hits rate limit */
  rateLimitReached: (usageCount: number) =>
    safeTrackEvent('interpreter_rate_limit_reached', { usage_count: usageCount }),
};

/**
 * Navigation and UI event tracking
 */
export const navigationEvents = {
  /** Track when user views a category page */
  categoryView: (category: string) => safeTrackEvent('category_view', { category }),

  /** Track when user clicks a category link */
  categoryClick: (category: string, source: string) =>
    safeTrackEvent('category_click', { category, source }),

  /** Track when user toggles theme */
  themeToggle: (theme: string) => safeTrackEvent('theme_toggle', { theme }),

  /** Track when mobile navigation is opened */
  mobileNavOpen: () => safeTrackEvent('mobile_nav_open', {}),

  /** Track when user clicks a breadcrumb */
  breadcrumbClick: (label: string, href: string, position: number) =>
    safeTrackEvent('breadcrumb_click', { label, href, position }),
};

/**
 * Engagement event tracking
 */
export const engagementEvents = {
  /** Track when user clicks an external link */
  externalLinkClick: (url: string, linkText: string) =>
    safeTrackEvent('external_link_click', { url, link_text: linkText }),

  /** Track scroll depth milestones */
  scrollDepth: (depth: 25 | 50 | 75 | 100, pagePath: string) =>
    safeTrackEvent('scroll_depth', { depth, page_path: pagePath }),
};

/**
 * Error event tracking
 */
export const errorEvents = {
  /** Track when search returns no results */
  searchNoResults: (searchTerm: string) =>
    safeTrackEvent('search_no_results', { search_term: searchTerm }),

  /** Track when user lands on 404 page */
  pageNotFound: (attemptedPath: string) =>
    safeTrackEvent('page_not_found', { attempted_path: attemptedPath }),
};

/**
 * Share event tracking
 */
export const shareEvents = {
  /** Track when user shares content via a platform */
  share: (platform: string, url: string, contentType: string) =>
    safeTrackEvent('content_share', { platform, url, content_type: contentType }),

  /** Track when user copies a share link */
  copyLink: (url: string, contentType: string) =>
    safeTrackEvent('share_link_copy', { url, content_type: contentType }),
};
