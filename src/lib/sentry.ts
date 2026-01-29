/**
 * Sentry error tracking utilities
 *
 * This module provides helper functions for error tracking and reporting to Sentry.
 * It wraps the Sentry SDK to provide consistent error handling across the application.
 */

import * as Sentry from '@sentry/nextjs';
import { getEnv, isTest } from './env';

/**
 * Check if Sentry is configured and available
 */
export function isSentryEnabled(): boolean {
  // Never enable Sentry in test environment
  if (isTest()) {
    return false;
  }

  const env = getEnv();
  return !!env.sentryDsn;
}

/**
 * Capture an error and report it to Sentry
 * @param error - The error to capture
 * @param context - Additional context to attach to the error
 */
export function captureError(
  error: Error | unknown,
  context?: Record<string, unknown>
): string | undefined {
  if (!isSentryEnabled()) {
    // In development/test, just log to console
    console.error('Error captured:', error, context);
    return undefined;
  }

  if (context) {
    Sentry.setContext('additional', context);
  }

  return Sentry.captureException(error);
}

/**
 * Capture a message and report it to Sentry
 * @param message - The message to capture
 * @param level - The severity level
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info'
): string | undefined {
  if (!isSentryEnabled()) {
    console.log(`[${level}] ${message}`);
    return undefined;
  }

  return Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry
 * @param user - User information to attach to events
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 * @param breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
  data?: Record<string, unknown>;
}): void {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.addBreadcrumb(breadcrumb);
}
