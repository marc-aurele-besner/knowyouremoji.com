import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import {
  isSentryEnabled,
  captureError,
  captureMessage,
  setUser,
  addBreadcrumb,
} from '@/lib/sentry';

// Store original env
const originalEnv = { ...process.env };

// Helper to set NODE_ENV while bypassing TypeScript's readonly constraint
function setNodeEnv(value: string | undefined) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe('Sentry utilities', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('isSentryEnabled', () => {
    it('should return false in test environment', () => {
      setNodeEnv('test');
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';

      expect(isSentryEnabled()).toBe(false);
    });

    it('should return false when SENTRY_DSN is not set', () => {
      setNodeEnv('production');
      delete process.env.SENTRY_DSN;

      expect(isSentryEnabled()).toBe(false);
    });

    it('should return true when SENTRY_DSN is set in non-test environment', () => {
      setNodeEnv('production');
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';

      expect(isSentryEnabled()).toBe(true);
    });
  });

  describe('captureError', () => {
    it('should log to console when Sentry is disabled (test env)', () => {
      setNodeEnv('test');
      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});

      const error = new Error('Test error');
      const result = captureError(error, { context: 'test' });

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Error captured:', error, { context: 'test' });

      consoleSpy.mockRestore();
    });

    it('should log error without context when not provided', () => {
      setNodeEnv('test');
      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});

      const error = new Error('Test error');
      const result = captureError(error);

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Error captured:', error, undefined);

      consoleSpy.mockRestore();
    });
  });

  describe('captureMessage', () => {
    it('should log to console when Sentry is disabled (test env)', () => {
      setNodeEnv('test');
      const consoleSpy = spyOn(console, 'log').mockImplementation(() => {});

      const result = captureMessage('Test message', 'warning');

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('[warning] Test message');

      consoleSpy.mockRestore();
    });

    it('should default to info level when not specified', () => {
      setNodeEnv('test');
      const consoleSpy = spyOn(console, 'log').mockImplementation(() => {});

      captureMessage('Test message');

      expect(consoleSpy).toHaveBeenCalledWith('[info] Test message');

      consoleSpy.mockRestore();
    });

    it('should use error level when specified', () => {
      setNodeEnv('test');
      const consoleSpy = spyOn(console, 'log').mockImplementation(() => {});

      captureMessage('Error message', 'error');

      expect(consoleSpy).toHaveBeenCalledWith('[error] Error message');

      consoleSpy.mockRestore();
    });
  });

  describe('setUser', () => {
    it('should not throw when Sentry is disabled', () => {
      setNodeEnv('test');

      // Should not throw
      expect(() => setUser({ id: '123', email: 'test@example.com' })).not.toThrow();
    });

    it('should accept null to clear user', () => {
      setNodeEnv('test');

      // Should not throw
      expect(() => setUser(null)).not.toThrow();
    });

    it('should accept user with all fields', () => {
      setNodeEnv('test');

      // Should not throw
      expect(() =>
        setUser({ id: '123', email: 'test@example.com', username: 'testuser' })
      ).not.toThrow();
    });
  });

  describe('addBreadcrumb', () => {
    it('should not throw when Sentry is disabled', () => {
      setNodeEnv('test');

      // Should not throw
      expect(() => addBreadcrumb({ message: 'Test breadcrumb', category: 'test' })).not.toThrow();
    });

    it('should accept breadcrumb with all fields', () => {
      setNodeEnv('test');

      // Should not throw
      expect(() =>
        addBreadcrumb({
          message: 'Test breadcrumb',
          category: 'test',
          level: 'info',
          data: { key: 'value' },
        })
      ).not.toThrow();
    });
  });
});
