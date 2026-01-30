import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { getEnv, validateEnv, isProduction, isDevelopment, isTest } from '../../../src/lib/env';

// Store original env
const originalEnv = { ...process.env };

// Helper to set NODE_ENV while bypassing TypeScript's readonly constraint
function setNodeEnv(value: string | undefined) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe('env configuration', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
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

    it('should return openaiApiKey when set', () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const env = getEnv();
      expect(env.openaiApiKey).toBe('sk-test-key');
    });

    it('should return undefined openaiApiKey when not set', () => {
      delete process.env.OPENAI_API_KEY;
      const env = getEnv();
      expect(env.openaiApiKey).toBeUndefined();
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

    it('should return supabaseUrl when set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      const env = getEnv();
      expect(env.supabaseUrl).toBe('https://test.supabase.co');
    });

    it('should return undefined supabaseUrl when not set', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      const env = getEnv();
      expect(env.supabaseUrl).toBeUndefined();
    });

    it('should return supabaseAnonKey when set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      const env = getEnv();
      expect(env.supabaseAnonKey).toBe('test-anon-key');
    });

    it('should return undefined supabaseAnonKey when not set', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const env = getEnv();
      expect(env.supabaseAnonKey).toBeUndefined();
    });

    it('should return supabaseServiceRoleKey when set', () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      const env = getEnv();
      expect(env.supabaseServiceRoleKey).toBe('test-service-role-key');
    });

    it('should return undefined supabaseServiceRoleKey when not set', () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      const env = getEnv();
      expect(env.supabaseServiceRoleKey).toBeUndefined();
    });
  });

  describe('validateEnv', () => {
    it('should return empty array when all required vars are set', () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'true';
      const warnings = validateEnv();
      expect(warnings).toEqual([]);
    });

    it('should warn when OPENAI_API_KEY is missing and interpreter is enabled', () => {
      delete process.env.OPENAI_API_KEY;
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'true';
      const warnings = validateEnv();
      expect(warnings).toContain('OPENAI_API_KEY is not set. Interpreter feature will not work.');
    });

    it('should not warn when OPENAI_API_KEY is missing but interpreter is disabled', () => {
      delete process.env.OPENAI_API_KEY;
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';
      const warnings = validateEnv();
      expect(warnings).not.toContain(
        'OPENAI_API_KEY is not set. Interpreter feature will not work.'
      );
    });

    it('should return empty warnings when OPENAI_API_KEY is set', () => {
      process.env.OPENAI_API_KEY = 'sk-valid-key';
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
