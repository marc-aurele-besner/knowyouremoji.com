import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

// Store original env
const originalEnv = { ...process.env };

describe('env configuration', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    // Clear module cache to ensure fresh import
    delete require.cache[require.resolve('../../../src/lib/env')];
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('getEnv', () => {
    it('should return default appUrl when not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.appUrl).toBe('http://localhost:3000');
    });

    it('should return custom appUrl when set', async () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://knowyouremoji.com';
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.appUrl).toBe('https://knowyouremoji.com');
    });

    it('should return default appName when not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_NAME;
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.appName).toBe('KnowYourEmoji');
    });

    it('should return custom appName when set', async () => {
      process.env.NEXT_PUBLIC_APP_NAME = 'CustomAppName';
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.appName).toBe('CustomAppName');
    });

    it('should return openaiApiKey when set', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.openaiApiKey).toBe('sk-test-key');
    });

    it('should return undefined openaiApiKey when not set', async () => {
      delete process.env.OPENAI_API_KEY;
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.openaiApiKey).toBeUndefined();
    });

    it('should return enableInterpreter as true when set to "true"', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'true';
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.enableInterpreter).toBe(true);
    });

    it('should return enableInterpreter as false when set to "false"', async () => {
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.enableInterpreter).toBe(false);
    });

    it('should return enableInterpreter as true by default', async () => {
      delete process.env.NEXT_PUBLIC_ENABLE_INTERPRETER;
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.enableInterpreter).toBe(true);
    });

    it('should return sentryDsn when set', async () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.sentryDsn).toBe('https://test@sentry.io/123');
    });

    it('should return undefined sentryDsn when not set', async () => {
      delete process.env.SENTRY_DSN;
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.sentryDsn).toBeUndefined();
    });

    it('should return vercelAnalyticsId when set', async () => {
      process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID = 'analytics-123';
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.vercelAnalyticsId).toBe('analytics-123');
    });

    it('should return undefined vercelAnalyticsId when not set', async () => {
      delete process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID;
      const { getEnv } = await import('../../../src/lib/env');
      const env = getEnv();
      expect(env.vercelAnalyticsId).toBeUndefined();
    });
  });

  describe('validateEnv', () => {
    it('should return empty array when all required vars are set', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'true';
      const { validateEnv } = await import('../../../src/lib/env');
      const warnings = validateEnv();
      expect(warnings).toEqual([]);
    });

    it('should warn when OPENAI_API_KEY is missing and interpreter is enabled', async () => {
      delete process.env.OPENAI_API_KEY;
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'true';
      const { validateEnv } = await import('../../../src/lib/env');
      const warnings = validateEnv();
      expect(warnings).toContain('OPENAI_API_KEY is not set. Interpreter feature will not work.');
    });

    it('should not warn when OPENAI_API_KEY is missing but interpreter is disabled', async () => {
      delete process.env.OPENAI_API_KEY;
      process.env.NEXT_PUBLIC_ENABLE_INTERPRETER = 'false';
      const { validateEnv } = await import('../../../src/lib/env');
      const warnings = validateEnv();
      expect(warnings).not.toContain(
        'OPENAI_API_KEY is not set. Interpreter feature will not work.'
      );
    });
  });

  describe('isProduction', () => {
    it('should return true when NODE_ENV is production', async () => {
      process.env.NODE_ENV = 'production';
      const { isProduction } = await import('../../../src/lib/env');
      expect(isProduction()).toBe(true);
    });

    it('should return false when NODE_ENV is development', async () => {
      process.env.NODE_ENV = 'development';
      const { isProduction } = await import('../../../src/lib/env');
      expect(isProduction()).toBe(false);
    });

    it('should return false when NODE_ENV is test', async () => {
      process.env.NODE_ENV = 'test';
      const { isProduction } = await import('../../../src/lib/env');
      expect(isProduction()).toBe(false);
    });
  });

  describe('isDevelopment', () => {
    it('should return true when NODE_ENV is development', async () => {
      process.env.NODE_ENV = 'development';
      const { isDevelopment } = await import('../../../src/lib/env');
      expect(isDevelopment()).toBe(true);
    });

    it('should return false when NODE_ENV is production', async () => {
      process.env.NODE_ENV = 'production';
      const { isDevelopment } = await import('../../../src/lib/env');
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('isTest', () => {
    it('should return true when NODE_ENV is test', async () => {
      process.env.NODE_ENV = 'test';
      const { isTest } = await import('../../../src/lib/env');
      expect(isTest()).toBe(true);
    });

    it('should return false when NODE_ENV is production', async () => {
      process.env.NODE_ENV = 'production';
      const { isTest } = await import('../../../src/lib/env');
      expect(isTest()).toBe(false);
    });

    it('should return false when NODE_ENV is development', async () => {
      process.env.NODE_ENV = 'development';
      const { isTest } = await import('../../../src/lib/env');
      expect(isTest()).toBe(false);
    });
  });
});
