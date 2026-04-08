import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { getEnv, validateEnv, isProduction, isDevelopment, isTest } from '../../../src/lib/env';

// All env var keys that tests may touch — used for save/restore
const TESTED_KEYS = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_NAME',
  'OPENROUTER_API_KEY',
  'OPENROUTER_MODEL',
  'NEXT_PUBLIC_ENABLE_INTERPRETER',
  'SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_POSTHOG_HOST',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'AUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'SLACK_BOT_TOKEN',
  'SLACK_LOG_CHANNEL_ID',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'DATABASE_URL',
  'NODE_ENV',
] as const;

// Save original values (undefined means the key was not set)
const savedEnv: Record<string, string | undefined> = {};

function saveEnv() {
  for (const key of TESTED_KEYS) {
    savedEnv[key] = process.env[key];
  }
}

function restoreEnv() {
  for (const key of TESTED_KEYS) {
    const original = savedEnv[key];
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
}

// Helper to set NODE_ENV while bypassing TypeScript's readonly constraint
function setNodeEnv(value: string | undefined) {
  if (value === undefined) {
    delete (process.env as Record<string, string | undefined>).NODE_ENV;
  } else {
    (process.env as Record<string, string | undefined>).NODE_ENV = value;
  }
}

describe('env configuration', () => {
  beforeEach(() => {
    saveEnv();
  });

  afterEach(() => {
    restoreEnv();
  });

  describe('getEnv', () => {
    it('should return default appUrl when not set', () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      const env = getEnv();
      expect(env.appUrl).toBe('http://localhost:3000');
    });

    it('should return custom appUrl when set', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://knowyouremoji.com';
      const env = getEnv();
      expect(env.appUrl).toBe('https://knowyouremoji.com');
    });

    it('should return default appName when not set', () => {
      delete process.env.NEXT_PUBLIC_APP_NAME;
      const env = getEnv();
      expect(env.appName).toBe('KnowYourEmoji');
    });

    it('should return custom appName when set', () => {
      process.env.NEXT_PUBLIC_APP_NAME = 'CustomAppName';
      const env = getEnv();
      expect(env.appName).toBe('CustomAppName');
    });

    it('should return openrouterApiKey when set', () => {
      process.env.OPENROUTER_API_KEY = 'sk-test-key';
      const env = getEnv();
      expect(env.openrouterApiKey).toBe('sk-test-key');
    });

    it('should return undefined openrouterApiKey when not set', () => {
      delete process.env.OPENROUTER_API_KEY;
      const env = getEnv();
      expect(env.openrouterApiKey).toBeUndefined();
    });

    it('should return enableInterpreter as true when set to "true"', () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'true';
      const env = getEnv();
      expect(env.enableInterpreter).toBe(true);
    });

    it('should return enableInterpreter as false when set to "false"', () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';
      const env = getEnv();
      expect(env.enableInterpreter).toBe(false);
    });

    it('should return enableInterpreter as true by default', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_INTERPRETER;
      const env = getEnv();
      expect(env.enableInterpreter).toBe(true);
    });

    it('should return sentryDsn when set', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      const env = getEnv();
      expect(env.sentryDsn).toBe('https://test@sentry.io/123');
    });

    it('should return undefined sentryDsn when not set', () => {
      delete process.env.SENTRY_DSN;
      const env = getEnv();
      expect(env.sentryDsn).toBeUndefined();
    });

    it('should return sentryDsnPublic when set', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://public@sentry.io/456';
      const env = getEnv();
      expect(env.sentryDsnPublic).toBe('https://public@sentry.io/456');
    });

    it('should return undefined sentryDsnPublic when not set', () => {
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
      const env = getEnv();
      expect(env.sentryDsnPublic).toBeUndefined();
    });

    it('should return gaMeasurementId when set', () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123';
      const env = getEnv();
      expect(env.gaMeasurementId).toBe('G-TESTID123');
    });

    it('should return undefined gaMeasurementId when not set', () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      const env = getEnv();
      expect(env.gaMeasurementId).toBeUndefined();
    });

    it('should return posthogKey when set', () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123';
      const env = getEnv();
      expect(env.posthogKey).toBe('phc_test123');
    });

    it('should return undefined posthogKey when not set', () => {
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const env = getEnv();
      expect(env.posthogKey).toBeUndefined();
    });

    it('should return posthogHost when set', () => {
      process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://app.posthog.com';
      const env = getEnv();
      expect(env.posthogHost).toBe('https://app.posthog.com');
    });

    it('should return undefined posthogHost when not set', () => {
      delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
      const env = getEnv();
      expect(env.posthogHost).toBeUndefined();
    });

    it('should return upstashRedisRestUrl when set', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      const env = getEnv();
      expect(env.upstashRedisRestUrl).toBe('https://test.upstash.io');
    });

    it('should return undefined upstashRedisRestUrl when not set', () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      const env = getEnv();
      expect(env.upstashRedisRestUrl).toBeUndefined();
    });

    it('should return upstashRedisRestToken when set', () => {
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
      const env = getEnv();
      expect(env.upstashRedisRestToken).toBe('test-redis-token');
    });

    it('should return undefined upstashRedisRestToken when not set', () => {
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      const env = getEnv();
      expect(env.upstashRedisRestToken).toBeUndefined();
    });

    it('should return authSecret when set', () => {
      process.env.AUTH_SECRET = 'test-auth-secret';
      const env = getEnv();
      expect(env.authSecret).toBe('test-auth-secret');
    });

    it('should return undefined authSecret when not set', () => {
      delete process.env.AUTH_SECRET;
      const env = getEnv();
      expect(env.authSecret).toBeUndefined();
    });

    it('should return resendApiKey when set', () => {
      process.env.RESEND_API_KEY = 'test-resend-key';
      const env = getEnv();
      expect(env.resendApiKey).toBe('test-resend-key');
    });

    it('should return undefined resendApiKey when not set', () => {
      delete process.env.RESEND_API_KEY;
      const env = getEnv();
      expect(env.resendApiKey).toBeUndefined();
    });

    it('should return resendFromEmail when set', () => {
      process.env.RESEND_FROM_EMAIL = 'noreply@test.com';
      const env = getEnv();
      expect(env.resendFromEmail).toBe('noreply@test.com');
    });

    it('should return undefined resendFromEmail when not set', () => {
      delete process.env.RESEND_FROM_EMAIL;
      const env = getEnv();
      expect(env.resendFromEmail).toBeUndefined();
    });

    it('should return slackBotToken when set', () => {
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      const env = getEnv();
      expect(env.slackBotToken).toBe('xoxb-test-token');
    });

    it('should return undefined slackBotToken when not set', () => {
      delete process.env.SLACK_BOT_TOKEN;
      const env = getEnv();
      expect(env.slackBotToken).toBeUndefined();
    });

    it('should return slackLogChannelId when set', () => {
      process.env.SLACK_LOG_CHANNEL_ID = 'C12345678';
      const env = getEnv();
      expect(env.slackLogChannelId).toBe('C12345678');
    });

    it('should return undefined slackLogChannelId when not set', () => {
      delete process.env.SLACK_LOG_CHANNEL_ID;
      const env = getEnv();
      expect(env.slackLogChannelId).toBeUndefined();
    });

    it('should return stripeSecretKey when set', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      const env = getEnv();
      expect(env.stripeSecretKey).toBe('sk_test_123');
    });

    it('should return undefined stripeSecretKey when not set', () => {
      delete process.env.STRIPE_SECRET_KEY;
      const env = getEnv();
      expect(env.stripeSecretKey).toBeUndefined();
    });

    it('should return stripePublishableKey when set', () => {
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      const env = getEnv();
      expect(env.stripePublishableKey).toBe('pk_test_123');
    });

    it('should return undefined stripePublishableKey when not set', () => {
      delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      const env = getEnv();
      expect(env.stripePublishableKey).toBeUndefined();
    });
  });

  describe('validateEnv', () => {
    it('should return empty array when all required vars are set', () => {
      process.env.OPENROUTER_API_KEY = 'sk-test-key';
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'true';
      const warnings = validateEnv();
      expect(warnings).toEqual([]);
    });

    it('should warn when OPENROUTER_API_KEY is missing and interpreter is enabled', () => {
      delete process.env.OPENROUTER_API_KEY;
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'true';
      const warnings = validateEnv();
      expect(warnings).toContain(
        'OPENROUTER_API_KEY is not set. Interpreter feature will not work.'
      );
    });

    it('should not warn when OPENROUTER_API_KEY is missing but interpreter is disabled', () => {
      delete process.env.OPENROUTER_API_KEY;
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';
      const warnings = validateEnv();
      expect(warnings).not.toContain(
        'OPENROUTER_API_KEY is not set. Interpreter feature will not work.'
      );
    });

    it('should return empty warnings when OPENROUTER_API_KEY is set', () => {
      process.env.OPENROUTER_API_KEY = 'sk-valid-key';
      delete process.env.NEXT_PUBLIC_ENABLE_INTERPRETER; // defaults to true
      const warnings = validateEnv();
      expect(warnings.length).toBe(0);
    });
  });

  describe('isProduction', () => {
    it('should return true when NODE_ENV is production', () => {
      setNodeEnv('production');
      expect(isProduction()).toBe(true);
    });

    it('should return false when NODE_ENV is development', () => {
      setNodeEnv('development');
      expect(isProduction()).toBe(false);
    });

    it('should return false when NODE_ENV is test', () => {
      setNodeEnv('test');
      expect(isProduction()).toBe(false);
    });

    it('should return false when NODE_ENV is undefined', () => {
      setNodeEnv(undefined);
      expect(isProduction()).toBe(false);
    });
  });

  describe('isDevelopment', () => {
    it('should return true when NODE_ENV is development', () => {
      setNodeEnv('development');
      expect(isDevelopment()).toBe(true);
    });

    it('should return false when NODE_ENV is production', () => {
      setNodeEnv('production');
      expect(isDevelopment()).toBe(false);
    });

    it('should return false when NODE_ENV is test', () => {
      setNodeEnv('test');
      expect(isDevelopment()).toBe(false);
    });

    it('should return false when NODE_ENV is undefined', () => {
      setNodeEnv(undefined);
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('isTest', () => {
    it('should return true when NODE_ENV is test', () => {
      setNodeEnv('test');
      expect(isTest()).toBe(true);
    });

    it('should return false when NODE_ENV is production', () => {
      setNodeEnv('production');
      expect(isTest()).toBe(false);
    });

    it('should return false when NODE_ENV is development', () => {
      setNodeEnv('development');
      expect(isTest()).toBe(false);
    });

    it('should return false when NODE_ENV is undefined', () => {
      setNodeEnv(undefined);
      expect(isTest()).toBe(false);
    });
  });
});
