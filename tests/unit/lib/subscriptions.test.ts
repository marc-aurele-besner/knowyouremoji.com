import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';

// Mock the db module before importing subscriptions
const mockSelect = mock(() => ({ from: mockFrom }));
const mockFrom = mock(() => ({ where: mockWhere }));
const mockWhere = mock(() => ({ limit: mockLimit }));
const mockLimit = mock(() => Promise.resolve([]));
const mockGetDb = mock(() => null);

mock.module('@/lib/db', () => ({
  getDb: mockGetDb,
}));

// Must import after mocking
import {
  getUserSubscription,
  hasActiveSubscription,
  isSubscriptionActive,
  getUserFeatureLimits,
  getFeatureLimits,
  canAccessFeature,
  getUserPlan,
  PLAN_LIMITS,
  DEFAULT_SUBSCRIPTION,
} from '../../../src/lib/subscriptions';
import type {
  UserSubscription,
  SubscriptionPlan,
  FeatureLimits,
} from '../../../src/lib/subscriptions';

// Helper to create a mock subscription
function createMockSubscription(overrides: Partial<UserSubscription> = {}): UserSubscription {
  return {
    id: 'sub-123',
    userId: 'user-456',
    status: 'active',
    plan: 'pro',
    stripeCustomerId: 'cus_test',
    stripeSubscriptionId: 'sub_test',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  };
}

// Helper to set up db mock to return rows
function setupDbMock(rows: Record<string, unknown>[]) {
  const limitFn = mock(() => Promise.resolve(rows));
  const whereFn = mock(() => ({ limit: limitFn }));
  const fromFn = mock(() => ({ where: whereFn }));
  const selectFn = mock(() => ({ from: fromFn }));
  const dbInstance = { select: selectFn };
  mockGetDb.mockReturnValue(dbInstance as unknown as ReturnType<typeof mockGetDb>);
  return { selectFn, fromFn, whereFn, limitFn };
}

describe('subscriptions module', () => {
  beforeEach(() => {
    mockGetDb.mockReset();
    mockGetDb.mockReturnValue(null);
  });

  afterEach(() => {
    mockGetDb.mockReset();
  });

  // ============================================
  // CONSTANTS
  // ============================================

  describe('PLAN_LIMITS', () => {
    it('should define free plan limits', () => {
      expect(PLAN_LIMITS.free).toEqual({
        interpretationsPerDay: 3,
        historyAccess: false,
        prioritySupport: false,
      });
    });

    it('should define pro plan limits', () => {
      expect(PLAN_LIMITS.pro).toEqual({
        interpretationsPerDay: 100,
        historyAccess: true,
        prioritySupport: true,
      });
    });
  });

  describe('DEFAULT_SUBSCRIPTION', () => {
    it('should have free status and plan', () => {
      expect(DEFAULT_SUBSCRIPTION.status).toBe('free');
      expect(DEFAULT_SUBSCRIPTION.plan).toBe('free');
    });

    it('should have null stripe fields', () => {
      expect(DEFAULT_SUBSCRIPTION.stripeCustomerId).toBeNull();
      expect(DEFAULT_SUBSCRIPTION.stripeSubscriptionId).toBeNull();
    });

    it('should have null period end', () => {
      expect(DEFAULT_SUBSCRIPTION.currentPeriodEnd).toBeNull();
    });
  });

  // ============================================
  // getUserSubscription
  // ============================================

  describe('getUserSubscription', () => {
    it('should return null when database is not configured', async () => {
      mockGetDb.mockReturnValue(null);
      const result = await getUserSubscription('user-123');
      expect(result).toBeNull();
    });

    it('should return null when no subscription exists', async () => {
      setupDbMock([]);
      const result = await getUserSubscription('user-123');
      expect(result).toBeNull();
    });

    it('should return the subscription when found', async () => {
      const mockRow = {
        id: 'sub-123',
        userId: 'user-456',
        status: 'active',
        plan: 'pro',
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        currentPeriodEnd: new Date('2026-06-01'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-15'),
      };
      setupDbMock([mockRow]);

      const result = await getUserSubscription('user-456');
      expect(result).toEqual({
        id: 'sub-123',
        userId: 'user-456',
        status: 'active',
        plan: 'pro',
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        currentPeriodEnd: new Date('2026-06-01'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-15'),
      });
    });

    it('should return subscription with null optional fields', async () => {
      const mockRow = {
        id: 'sub-789',
        userId: 'user-456',
        status: 'free',
        plan: 'free',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      setupDbMock([mockRow]);

      const result = await getUserSubscription('user-456');
      expect(result).not.toBeNull();
      expect(result!.stripeCustomerId).toBeNull();
      expect(result!.stripeSubscriptionId).toBeNull();
      expect(result!.currentPeriodEnd).toBeNull();
    });
  });

  // ============================================
  // isSubscriptionActive
  // ============================================

  describe('isSubscriptionActive', () => {
    it('should return true for active subscription without period end', () => {
      const sub = createMockSubscription({ currentPeriodEnd: null });
      expect(isSubscriptionActive(sub)).toBe(true);
    });

    it('should return true for active subscription with future period end', () => {
      const sub = createMockSubscription({
        currentPeriodEnd: new Date(Date.now() + 86400000),
      });
      expect(isSubscriptionActive(sub)).toBe(true);
    });

    it('should return false for active subscription with past period end', () => {
      const sub = createMockSubscription({
        currentPeriodEnd: new Date(Date.now() - 86400000),
      });
      expect(isSubscriptionActive(sub)).toBe(false);
    });

    it('should return false for canceled subscription', () => {
      const sub = createMockSubscription({ status: 'canceled' });
      expect(isSubscriptionActive(sub)).toBe(false);
    });

    it('should return false for past_due subscription', () => {
      const sub = createMockSubscription({ status: 'past_due' });
      expect(isSubscriptionActive(sub)).toBe(false);
    });

    it('should return false for free status subscription', () => {
      const sub = createMockSubscription({ status: 'free' });
      expect(isSubscriptionActive(sub)).toBe(false);
    });
  });

  // ============================================
  // hasActiveSubscription
  // ============================================

  describe('hasActiveSubscription', () => {
    it('should return false when database is not configured', async () => {
      mockGetDb.mockReturnValue(null);
      const result = await hasActiveSubscription('user-123');
      expect(result).toBe(false);
    });

    it('should return false when no subscription exists', async () => {
      setupDbMock([]);
      const result = await hasActiveSubscription('user-123');
      expect(result).toBe(false);
    });

    it('should return true for active subscription', async () => {
      const mockRow = {
        id: 'sub-123',
        userId: 'user-456',
        status: 'active',
        plan: 'pro',
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      setupDbMock([mockRow]);

      const result = await hasActiveSubscription('user-456');
      expect(result).toBe(true);
    });

    it('should return false for canceled subscription', async () => {
      const mockRow = {
        id: 'sub-123',
        userId: 'user-456',
        status: 'canceled',
        plan: 'pro',
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      setupDbMock([mockRow]);

      const result = await hasActiveSubscription('user-456');
      expect(result).toBe(false);
    });
  });

  // ============================================
  // getFeatureLimits
  // ============================================

  describe('getFeatureLimits', () => {
    it('should return free plan limits', () => {
      const limits = getFeatureLimits('free');
      expect(limits.interpretationsPerDay).toBe(3);
      expect(limits.historyAccess).toBe(false);
      expect(limits.prioritySupport).toBe(false);
    });

    it('should return pro plan limits', () => {
      const limits = getFeatureLimits('pro');
      expect(limits.interpretationsPerDay).toBe(100);
      expect(limits.historyAccess).toBe(true);
      expect(limits.prioritySupport).toBe(true);
    });

    it('should default to free for unknown plan', () => {
      const limits = getFeatureLimits('unknown' as SubscriptionPlan);
      expect(limits).toEqual(PLAN_LIMITS.free);
    });
  });

  // ============================================
  // getUserFeatureLimits
  // ============================================

  describe('getUserFeatureLimits', () => {
    it('should return free limits when database is not configured', async () => {
      mockGetDb.mockReturnValue(null);
      const limits = await getUserFeatureLimits('user-123');
      expect(limits).toEqual(PLAN_LIMITS.free);
    });

    it('should return free limits when no subscription exists', async () => {
      setupDbMock([]);
      const limits = await getUserFeatureLimits('user-123');
      expect(limits).toEqual(PLAN_LIMITS.free);
    });

    it('should return pro limits for active pro subscription', async () => {
      const mockRow = {
        id: 'sub-123',
        userId: 'user-456',
        status: 'active',
        plan: 'pro',
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      setupDbMock([mockRow]);

      const limits = await getUserFeatureLimits('user-456');
      expect(limits).toEqual(PLAN_LIMITS.pro);
    });

    it('should return free limits for inactive subscription', async () => {
      const mockRow = {
        id: 'sub-123',
        userId: 'user-456',
        status: 'canceled',
        plan: 'pro',
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        currentPeriodEnd: new Date(Date.now() - 86400000),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      setupDbMock([mockRow]);

      const limits = await getUserFeatureLimits('user-456');
      expect(limits).toEqual(PLAN_LIMITS.free);
    });
  });

  // ============================================
  // canAccessFeature
  // ============================================

  describe('canAccessFeature', () => {
    it('should return false for historyAccess on free plan', async () => {
      mockGetDb.mockReturnValue(null);
      const result = await canAccessFeature('user-123', 'historyAccess');
      expect(result).toBe(false);
    });

    it('should return false for prioritySupport on free plan', async () => {
      mockGetDb.mockReturnValue(null);
      const result = await canAccessFeature('user-123', 'prioritySupport');
      expect(result).toBe(false);
    });

    it('should return true for interpretationsPerDay on free plan', async () => {
      mockGetDb.mockReturnValue(null);
      const result = await canAccessFeature('user-123', 'interpretationsPerDay');
      expect(result).toBe(true);
    });

    it('should return true for historyAccess on active pro plan', async () => {
      const mockRow = {
        id: 'sub-123',
        userId: 'user-456',
        status: 'active',
        plan: 'pro',
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      setupDbMock([mockRow]);

      const result = await canAccessFeature('user-456', 'historyAccess');
      expect(result).toBe(true);
    });

    it('should return true for prioritySupport on active pro plan', async () => {
      const mockRow = {
        id: 'sub-123',
        userId: 'user-456',
        status: 'active',
        plan: 'pro',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      setupDbMock([mockRow]);

      const result = await canAccessFeature('user-456', 'prioritySupport');
      expect(result).toBe(true);
    });
  });

  // ============================================
  // getUserPlan
  // ============================================

  describe('getUserPlan', () => {
    it('should return free when database is not configured', async () => {
      mockGetDb.mockReturnValue(null);
      const plan = await getUserPlan('user-123');
      expect(plan).toBe('free');
    });

    it('should return free when no subscription exists', async () => {
      setupDbMock([]);
      const plan = await getUserPlan('user-123');
      expect(plan).toBe('free');
    });

    it('should return pro for active pro subscription', async () => {
      const mockRow = {
        id: 'sub-123',
        userId: 'user-456',
        status: 'active',
        plan: 'pro',
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      setupDbMock([mockRow]);

      const plan = await getUserPlan('user-456');
      expect(plan).toBe('pro');
    });

    it('should return free for canceled pro subscription', async () => {
      const mockRow = {
        id: 'sub-123',
        userId: 'user-456',
        status: 'canceled',
        plan: 'pro',
        stripeCustomerId: 'cus_test',
        stripeSubscriptionId: 'sub_test',
        currentPeriodEnd: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };
      setupDbMock([mockRow]);

      const plan = await getUserPlan('user-456');
      expect(plan).toBe('free');
    });
  });

  // ============================================
  // Type exports verification
  // ============================================

  describe('type exports', () => {
    it('should export SubscriptionStatus type', () => {
      const status: import('../../../src/lib/subscriptions').SubscriptionStatus = 'active';
      expect(status).toBe('active');
    });

    it('should export SubscriptionPlan type', () => {
      const plan: import('../../../src/lib/subscriptions').SubscriptionPlan = 'pro';
      expect(plan).toBe('pro');
    });

    it('should export UserSubscription type', () => {
      const sub: import('../../../src/lib/subscriptions').UserSubscription =
        createMockSubscription();
      expect(sub.id).toBeDefined();
    });

    it('should export FeatureLimits type', () => {
      const limits: import('../../../src/lib/subscriptions').FeatureLimits = PLAN_LIMITS.free;
      expect(limits.interpretationsPerDay).toBeDefined();
    });
  });
});
