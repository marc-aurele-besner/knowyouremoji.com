/**
 * Subscription Status Checks for KnowYourEmoji
 *
 * This module provides middleware/utility functions for feature gating
 * based on user subscription status. It checks the subscriptions table
 * to determine user plan and enforces feature limits accordingly.
 *
 * Gracefully degrades when the database is not configured, defaulting
 * to free plan limits.
 */

import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';

// ============================================
// TYPES
// ============================================

/** Subscription status values */
export type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due';

/** Subscription plan tiers */
export type SubscriptionPlan = 'free' | 'pro';

/** User subscription record */
export interface UserSubscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Feature limits per plan */
export interface FeatureLimits {
  interpretationsPerDay: number;
  historyAccess: boolean;
  prioritySupport: boolean;
}

// ============================================
// CONSTANTS
// ============================================

/** Feature limits for each plan tier */
export const PLAN_LIMITS: Record<SubscriptionPlan, FeatureLimits> = {
  free: {
    interpretationsPerDay: 3,
    historyAccess: false,
    prioritySupport: false,
  },
  pro: {
    interpretationsPerDay: 100,
    historyAccess: true,
    prioritySupport: true,
  },
};

/** Default subscription for users without a subscription record */
export const DEFAULT_SUBSCRIPTION: Omit<
  UserSubscription,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
> = {
  status: 'free',
  plan: 'free',
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currentPeriodEnd: null,
};

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Get a user's subscription from the database.
 * Returns null if the database is not configured or no subscription exists.
 *
 * @param userId - The user's UUID
 * @returns The user's subscription or null
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const db = getDb();
  if (!db) {
    return null;
  }

  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.userId,
    status: row.status as SubscriptionStatus,
    plan: row.plan as SubscriptionPlan,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    currentPeriodEnd: row.currentPeriodEnd,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Check if a user has an active premium subscription.
 * Returns false if the database is not configured, no subscription exists,
 * or the subscription has expired.
 *
 * @param userId - The user's UUID
 * @returns Whether the user has an active premium subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return false;
  }

  return isSubscriptionActive(subscription);
}

/**
 * Check if a subscription is currently active.
 * An active subscription has status 'active' and, if it has a period end date,
 * that date must be in the future.
 *
 * @param subscription - The subscription to check
 * @returns Whether the subscription is active
 */
export function isSubscriptionActive(subscription: UserSubscription): boolean {
  if (subscription.status !== 'active') {
    return false;
  }

  if (subscription.currentPeriodEnd) {
    return subscription.currentPeriodEnd > new Date();
  }

  return true;
}

/**
 * Get feature limits for a given user.
 * Falls back to free plan limits if subscription is not found or inactive.
 *
 * @param userId - The user's UUID
 * @returns Feature limits for the user's current plan
 */
export async function getUserFeatureLimits(userId: string): Promise<FeatureLimits> {
  const subscription = await getUserSubscription(userId);
  if (!subscription || !isSubscriptionActive(subscription)) {
    return PLAN_LIMITS.free;
  }

  return getFeatureLimits(subscription.plan);
}

/**
 * Get feature limits for a given plan.
 *
 * @param plan - The subscription plan
 * @returns Feature limits for the plan
 */
export function getFeatureLimits(plan: SubscriptionPlan): FeatureLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

/**
 * Check if a user can access a specific feature.
 *
 * @param userId - The user's UUID
 * @param feature - The feature key to check
 * @returns Whether the user can access the feature
 */
export async function canAccessFeature(
  userId: string,
  feature: keyof FeatureLimits
): Promise<boolean> {
  const limits = await getUserFeatureLimits(userId);
  const value = limits[feature];
  return typeof value === 'boolean' ? value : value > 0;
}

/**
 * Get the user's current plan name.
 * Returns 'free' if no subscription or database not configured.
 *
 * @param userId - The user's UUID
 * @returns The plan name
 */
export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  const subscription = await getUserSubscription(userId);
  if (!subscription || !isSubscriptionActive(subscription)) {
    return 'free';
  }

  return subscription.plan;
}
