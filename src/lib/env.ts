/**
 * Environment configuration for KnowYourEmoji
 *
 * This module provides typed access to environment variables with sensible defaults.
 * For Phase 1 (MVP/Beta), we only need minimal environment variables.
 */

/**
 * Environment variable configuration interface
 */
export interface EnvConfig {
  /** Application URL (defaults to localhost:3000) */
  appUrl: string;
  /** Application name (defaults to KnowYourEmoji) */
  appName: string;
  /** OpenAI API key for interpreter feature */
  openaiApiKey: string | undefined;
  /** Whether the interpreter feature is enabled */
  enableInterpreter: boolean;
  /** Sentry DSN for error monitoring */
  sentryDsn: string | undefined;
  /** Vercel Analytics ID */
  vercelAnalyticsId: string | undefined;
}

/**
 * Get the current environment configuration
 * Uses a function to ensure fresh reads of process.env
 */
export function getEnv(): EnvConfig {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'KnowYourEmoji',
    openaiApiKey: process.env.OPENAI_API_KEY,
    enableInterpreter: process.env.NEXT_PUBLIC_ENABLE_INTERPRETER !== 'false',
    sentryDsn: process.env.SENTRY_DSN,
    vercelAnalyticsId: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
  };
}

/**
 * Validate environment variables and return warnings
 * @returns Array of warning messages for missing or misconfigured variables
 */
export function validateEnv(): string[] {
  const env = getEnv();
  const warnings: string[] = [];

  // Warn if interpreter is enabled but OpenAI key is missing
  if (env.enableInterpreter && !env.openaiApiKey) {
    warnings.push('OPENAI_API_KEY is not set. Interpreter feature will not work.');
  }

  return warnings;
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}
