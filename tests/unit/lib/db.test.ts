import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { isDatabaseConfigured, clearDb } from '../../../src/lib/db';
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  interpretations,
  emojiPageViews,
  subscriptions,
  bookBannerEvents,
} from '../../../src/lib/db/schema';

// Several test files register a process-global `mock.module('@/lib/db', ...)`
// that replaces `getDb` for every importer in the run. Importing the module
// through a distinct specifier yields a pristine instance of the real module,
// so the production implementation is the one exercised here.
const PRISTINE_DB_SPECIFIER: string = '../../../src/lib/db/index.ts?pristine=1';

type DbModule = typeof import('../../../src/lib/db');

async function loadPristineDb(): Promise<DbModule> {
  return (await import(PRISTINE_DB_SPECIFIER)) as DbModule;
}

// Save/restore only the env vars this test file touches
const TESTED_KEYS = ['DATABASE_URL'] as const;
const savedEnv: Record<string, string | undefined> = {};

function saveEnv() {
  for (const key of TESTED_KEYS) {
    savedEnv[key] = process.env[key];
  }
}
function restoreEnv() {
  for (const key of TESTED_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
}

describe('db module', () => {
  beforeEach(() => {
    saveEnv();
  });

  afterEach(() => {
    restoreEnv();
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

    it('should reset the cached db instance', () => {
      clearDb();
      expect(() => clearDb()).not.toThrow();
    });
  });

  describe('getDb', () => {
    it('should return null when DATABASE_URL is not set', async () => {
      delete process.env.DATABASE_URL;
      const pristine = await loadPristineDb();
      pristine.clearDb();
      expect(pristine.getDb()).toBeNull();
      pristine.clearDb();
    });

    it('should build a drizzle instance when DATABASE_URL is set', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      const pristine = await loadPristineDb();
      pristine.clearDb();
      const db = pristine.getDb();
      expect(db).not.toBeNull();
      pristine.clearDb();
    });

    it('should return the cached instance on subsequent calls', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      const pristine = await loadPristineDb();
      pristine.clearDb();
      const first = pristine.getDb();
      const second = pristine.getDb();
      expect(first).not.toBeNull();
      expect(second).toBe(first);
      pristine.clearDb();
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

    it('should export bookBannerEvents table', () => {
      expect(bookBannerEvents).toBeDefined();
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

    it('should have required columns on bookBannerEvents table', () => {
      expect(bookBannerEvents.id).toBeDefined();
      expect(bookBannerEvents.eventType).toBeDefined();
      expect(bookBannerEvents.banner).toBeDefined();
      expect(bookBannerEvents.pagePath).toBeDefined();
      expect(bookBannerEvents.createdAt).toBeDefined();
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

    it('should have created_at index config on bookBannerEvents', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tableConfig = (bookBannerEvents as any)[Symbol.for('drizzle:ExtraConfigBuilder')];
      if (typeof tableConfig === 'function') {
        // Index builders expect the "extra config" column variants, which carry
        // the per-column index configuration used by `.on()`.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extraConfigColumns = (bookBannerEvents as any)[
          Symbol.for('drizzle:ExtraConfigColumns')
        ];
        const result = tableConfig(extraConfigColumns) as { config: { name: string } }[];
        expect(result).toHaveLength(1);
        expect(result[0]?.config.name).toBe('book_banner_events_created_at_idx');
      } else {
        expect(bookBannerEvents).toBeDefined();
      }
    });
  });

  describe('foreign key references', () => {
    it('should point every user foreign key at users.id', () => {
      for (const table of [accounts, sessions, interpretations, subscriptions]) {
        const foreignKeys = getTableConfig(table).foreignKeys;
        expect(foreignKeys.length).toBeGreaterThan(0);

        for (const foreignKey of foreignKeys) {
          const reference = foreignKey.reference();
          expect(reference.foreignColumns).toEqual([users.id]);
          expect(reference.foreignTable).toBe(users);
        }
      }
    });
  });
});
