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
  /** OpenRouter API key for interpreter feature */
  openrouterApiKey: string | undefined;
  /** OpenRouter model for interpreter (defaults to liquid/lfm2-8b-a1b) */
  openrouterModel: string;
  /** Whether the interpreter feature is enabled */
  enableInterpreter: boolean;
  /** Sentry DSN for error monitoring (server-side) */
  sentryDsn: string | undefined;
  /** Sentry DSN for error monitoring (client-side, public) */
  sentryDsnPublic: string | undefined;
  /** Google Analytics Measurement ID (starts with G-) */
  gaMeasurementId: string | undefined;
  /** PostHog project API key for product analytics */
  posthogKey: string | undefined;
  /** PostHog API host URL */
  posthogHost: string | undefined;
  /** Upstash Redis REST URL for caching (Phase 2) */
  upstashRedisRestUrl: string | undefined;
  /** Upstash Redis REST token for authentication (Phase 2) */
  upstashRedisRestToken: string | undefined;
  /** NextAuth secret for JWT signing */
  authSecret: string | undefined;
  /** Google OAuth client ID */
  googleClientId: string | undefined;
  /** Google OAuth client secret */
  googleClientSecret: string | undefined;
  /** GitHub OAuth client ID */
  githubClientId: string | undefined;
  /** GitHub OAuth client secret */
  githubClientSecret: string | undefined;
  /** Resend API key for transactional emails */
  resendApiKey: string | undefined;
  /** Resend from email address */
  resendFromEmail: string | undefined;
  /** Slack Bot token for logging interpreter usage */
  slackBotToken: string | undefined;
  /** Slack channel ID for interpreter usage logs */
  slackLogChannelId: string | undefined;
  /**
   * Neon Postgres connection string (server-only).
   * When set, emoji detail views increment popularity used on the homepage.
   */
  databaseUrl: string | undefined;
}

/**
 * Get the current environment configuration
 * Uses a function to ensure fresh reads of process.env
 */
export function getEnv(): EnvConfig {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'KnowYourEmoji',
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    openrouterModel: process.env.OPENROUTER_MODEL || 'liquid/lfm2-8b-a1b',
    enableInterpreter: process.env.NEXT_PUBLIC_ENABLE_INTERPRETER !== 'false',
    sentryDsn: process.env.SENTRY_DSN,
    sentryDsnPublic: process.env.NEXT_PUBLIC_SENTRY_DSN,
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
    upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    authSecret: process.env.AUTH_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    resendApiKey: process.env.RESEND_API_KEY,
    resendFromEmail: process.env.RESEND_FROM_EMAIL,
    slackBotToken: process.env.SLACK_BOT_TOKEN,
    slackLogChannelId: process.env.SLACK_LOG_CHANNEL_ID,
    databaseUrl: process.env.DATABASE_URL,
  };
}

/**
 * Validate environment variables and return warnings
 * @returns Array of warning messages for missing or misconfigured variables
 */
export function validateEnv(): string[] {
  const env = getEnv();
  const warnings: string[] = [];

  // Warn if interpreter is enabled but OpenRouter key is missing
  if (env.enableInterpreter && !env.openrouterApiKey) {
    warnings.push('OPENROUTER_API_KEY is not set. Interpreter feature will not work.');
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
