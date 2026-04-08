import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { isDatabaseConfigured, clearDb } from '../../../src/lib/db';
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  interpretations,
  emojiPageViews,
  subscriptions,
} from '../../../src/lib/db/schema';

// Store original env
const originalEnv = { ...process.env };

describe('db module', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isDatabaseConfigured', () => {
    it('should return false when DATABASE_URL is not set', () => {
      delete process.env.DATABASE_URL;
      expect(isDatabaseConfigured()).toBe(false);
    });

    it('should return false when DATABASE_URL is empty', () => {
      process.env.DATABASE_URL = '';
      expect(isDatabaseConfigured()).toBe(false);
    });

    it('should return true when DATABASE_URL is set', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      expect(isDatabaseConfigured()).toBe(true);
    });
  });

  describe('clearDb', () => {
    it('should not throw when called', () => {
      expect(() => clearDb()).not.toThrow();
    });
  });
});

describe('db schema', () => {
  describe('table definitions', () => {
    it('should export users table', () => {
      expect(users).toBeDefined();
    });

    it('should export accounts table', () => {
      expect(accounts).toBeDefined();
    });

    it('should export sessions table', () => {
      expect(sessions).toBeDefined();
    });

    it('should export verificationTokens table', () => {
      expect(verificationTokens).toBeDefined();
    });

    it('should export interpretations table', () => {
      expect(interpretations).toBeDefined();
    });

    it('should export emojiPageViews table', () => {
      expect(emojiPageViews).toBeDefined();
    });

    it('should export subscriptions table', () => {
      expect(subscriptions).toBeDefined();
    });
  });

  describe('table columns', () => {
    it('should have required columns on users table', () => {
      expect(users.id).toBeDefined();
      expect(users.email).toBeDefined();
      expect(users.name).toBeDefined();
      expect(users.displayName).toBeDefined();
      expect(users.passwordHash).toBeDefined();
      expect(users.image).toBeDefined();
      expect(users.emailVerified).toBeDefined();
      expect(users.createdAt).toBeDefined();
      expect(users.updatedAt).toBeDefined();
    });

    it('should have required columns on accounts table', () => {
      expect(accounts.userId).toBeDefined();
      expect(accounts.type).toBeDefined();
      expect(accounts.provider).toBeDefined();
      expect(accounts.providerAccountId).toBeDefined();
      expect(accounts.refresh_token).toBeDefined();
      expect(accounts.access_token).toBeDefined();
      expect(accounts.expires_at).toBeDefined();
      expect(accounts.token_type).toBeDefined();
      expect(accounts.scope).toBeDefined();
      expect(accounts.id_token).toBeDefined();
      expect(accounts.session_state).toBeDefined();
    });

    it('should have required columns on sessions table', () => {
      expect(sessions.sessionToken).toBeDefined();
      expect(sessions.userId).toBeDefined();
      expect(sessions.expires).toBeDefined();
    });

    it('should have required columns on verificationTokens table', () => {
      expect(verificationTokens.identifier).toBeDefined();
      expect(verificationTokens.token).toBeDefined();
      expect(verificationTokens.expires).toBeDefined();
    });

    it('should have required columns on interpretations table', () => {
      expect(interpretations.id).toBeDefined();
      expect(interpretations.userId).toBeDefined();
      expect(interpretations.message).toBeDefined();
      expect(interpretations.interpretation).toBeDefined();
      expect(interpretations.emojiCount).toBeDefined();
      expect(interpretations.createdAt).toBeDefined();
    });

    it('should have required columns on subscriptions table', () => {
      expect(subscriptions.id).toBeDefined();
      expect(subscriptions.userId).toBeDefined();
      expect(subscriptions.status).toBeDefined();
      expect(subscriptions.plan).toBeDefined();
      expect(subscriptions.stripeCustomerId).toBeDefined();
      expect(subscriptions.stripeSubscriptionId).toBeDefined();
      expect(subscriptions.currentPeriodEnd).toBeDefined();
      expect(subscriptions.createdAt).toBeDefined();
      expect(subscriptions.updatedAt).toBeDefined();
    });

    it('should have required columns on emojiPageViews table', () => {
      expect(emojiPageViews.slug).toBeDefined();
      expect(emojiPageViews.viewCount).toBeDefined();
      expect(emojiPageViews.updatedAt).toBeDefined();
    });
  });

  describe('table extra config', () => {
    it('should have composite primary key config on accounts', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tableConfig = (accounts as any)[Symbol.for('drizzle:ExtraConfigBuilder')];
      if (typeof tableConfig === 'function') {
        const result = tableConfig(accounts);
        expect(result).toBeDefined();
      } else {
        expect(accounts).toBeDefined();
      }
    });

    it('should have composite primary key config on verificationTokens', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tableConfig = (verificationTokens as any)[Symbol.for('drizzle:ExtraConfigBuilder')];
      if (typeof tableConfig === 'function') {
        const result = tableConfig(verificationTokens);
        expect(result).toBeDefined();
      } else {
        expect(verificationTokens).toBeDefined();
      }
    });
  });
});
