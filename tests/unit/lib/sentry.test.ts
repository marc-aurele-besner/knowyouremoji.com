import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import {
  isSentryEnabled,
  captureError,
  captureMessage,
  setUser,
  addBreadcrumb,
} from '@/lib/sentry';
import * as Sentry from '@sentry/nextjs';

// Save/restore only the env vars this test file touches
const TESTED_KEYS = ['NODE_ENV', 'SENTRY_DSN'] as const;
const savedEnv: Record<string, string | undefined> = {};

function saveEnv() {
  for (const key of TESTED_KEYS) {
    savedEnv[key] = process.env[key];
  }
}
function restoreEnv() {
  const env = process.env as Record<string, string | undefined>;
  for (const key of TESTED_KEYS) {
    if (savedEnv[key] === undefined) {
      delete env[key];
    } else {
      env[key] = savedEnv[key];
    }
  }
}

// Helper to set NODE_ENV while bypassing TypeScript's readonly constraint
function setNodeEnv(value: string | undefined) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe('Sentry utilities', () => {
  beforeEach(() => {
    saveEnv();
  });

  afterEach(() => {
    restoreEnv();
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

  // ============================================
  // Sentry-enabled path tests
  // ============================================

  describe('when Sentry is enabled', () => {
    let captureExceptionSpy: ReturnType<typeof spyOn>;
    let captureMessageSpy: ReturnType<typeof spyOn>;
    let setUserSpy: ReturnType<typeof spyOn>;
    let setContextSpy: ReturnType<typeof spyOn>;
    let addBreadcrumbSpy: ReturnType<typeof spyOn>;

    beforeEach(() => {
      setNodeEnv('production');
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      captureExceptionSpy = spyOn(Sentry, 'captureException').mockReturnValue('mock-event-id');
      captureMessageSpy = spyOn(Sentry, 'captureMessage').mockReturnValue('mock-message-id');
      setUserSpy = spyOn(Sentry, 'setUser').mockImplementation(() => {});
      setContextSpy = spyOn(Sentry, 'setContext').mockImplementation(() => {});
      addBreadcrumbSpy = spyOn(Sentry, 'addBreadcrumb').mockImplementation(() => {});
    });

    afterEach(() => {
      captureExceptionSpy.mockRestore();
      captureMessageSpy.mockRestore();
      setUserSpy.mockRestore();
      setContextSpy.mockRestore();
      addBreadcrumbSpy.mockRestore();
    });

    it('captureError should call Sentry.captureException', () => {
      const error = new Error('Production error');
      const result = captureError(error);

      expect(captureExceptionSpy).toHaveBeenCalledWith(error);
      expect(result).toBe('mock-event-id');
    });

    it('captureError should set context when provided', () => {
      const error = new Error('Production error');
      const context = { userId: '123', action: 'test' };
      captureError(error, context);

      expect(setContextSpy).toHaveBeenCalledWith('additional', context);
      expect(captureExceptionSpy).toHaveBeenCalledWith(error);
    });

    it('captureError should not set context when not provided', () => {
      const error = new Error('Production error');
      captureError(error);

      expect(setContextSpy).not.toHaveBeenCalled();
    });

    it('captureMessage should call Sentry.captureMessage', () => {
      const result = captureMessage('Production message', 'warning');

      expect(captureMessageSpy).toHaveBeenCalledWith('Production message', 'warning');
      expect(result).toBe('mock-message-id');
    });

    it('setUser should call Sentry.setUser', () => {
      const user = { id: '123', email: 'test@example.com' };
      setUser(user);

      expect(setUserSpy).toHaveBeenCalledWith(user);
    });

    it('setUser should call Sentry.setUser with null to clear', () => {
      setUser(null);

      expect(setUserSpy).toHaveBeenCalledWith(null);
    });

    it('addBreadcrumb should call Sentry.addBreadcrumb', () => {
      const breadcrumb = { message: 'User clicked', category: 'ui', level: 'info' as const };
      addBreadcrumb(breadcrumb);

      expect(addBreadcrumbSpy).toHaveBeenCalledWith(breadcrumb);
    });
  });
});
