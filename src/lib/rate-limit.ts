/**
 * Client-side rate limiting for the interpreter tool
 *
 * This module provides localStorage-based rate limiting for Phase 1 (MVP/Beta).
 * Users get 3 free interpretations per day, resetting at midnight local time.
 */

/** localStorage key for rate limit data */
export const STORAGE_KEY = 'kye_rate_limit';

/** Default maximum uses per day */
export const DEFAULT_MAX_USES = 3;

/** Stored rate limit data structure */
interface RateLimitData {
  count: number;
  date: string;
}

/**
 * Rate limiter class for tracking daily usage
 */
export class RateLimiter {
  private maxUses: number;

  /**
   * Create a new rate limiter instance
   * @param maxUses - Maximum uses per day (defaults to 3)
   */
  constructor(maxUses: number = DEFAULT_MAX_USES) {
    this.maxUses = Math.max(0, maxUses);
  }

  /**
   * Check if localStorage is available
   */
  private isStorageAvailable(): boolean {
    try {
      return typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Get the current date string for comparison
   */
  private getTodayString(): string {
    return new Date().toDateString();
  }

  /**
   * Load stored rate limit data from localStorage
   */
  private loadData(): RateLimitData | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const data = JSON.parse(stored) as Partial<RateLimitData>;

      // Validate data structure
      if (typeof data.count !== 'number' || typeof data.date !== 'string') {
        return null;
      }

      return data as RateLimitData;
    } catch {
      // Handle corrupted data
      return null;
    }
  }

  /**
   * Save rate limit data to localStorage
   */
  private saveData(data: RateLimitData): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors (e.g., quota exceeded)
    }
  }

  /**
   * Get the current usage count, accounting for date changes
   */
  private getCurrentCount(): number {
    const data = this.loadData();

    if (!data) {
      return 0;
    }

    // Reset if date has changed
    if (data.date !== this.getTodayString()) {
      return 0;
    }

    return data.count;
  }

  /**
   * Check if the user can still use the interpreter
   * @returns true if under the daily limit
   */
  canUse(): boolean {
    return this.getCurrentCount() < this.maxUses;
  }

  /**
   * Record a usage of the interpreter
   * @returns The remaining number of uses after recording
   */
  recordUse(): number {
    if (!this.canUse()) {
      return 0;
    }

    const currentCount = this.getCurrentCount();
    const newCount = currentCount + 1;

    this.saveData({
      count: newCount,
      date: this.getTodayString(),
    });

    return this.maxUses - newCount;
  }

  /**
   * Get the remaining number of uses for today
   * @returns Number of remaining uses
   */
  getRemainingUses(): number {
    const used = this.getCurrentCount();
    return Math.max(0, this.maxUses - used);
  }

  /**
   * Get the number of uses recorded today
   * @returns Number of uses today
   */
  getUsedCount(): number {
    return this.getCurrentCount();
  }

  /**
   * Get the maximum uses per day
   * @returns Maximum uses configured
   */
  getMaxUses(): number {
    return this.maxUses;
  }

  /**
   * Reset the rate limit (for testing or admin purposes)
   */
  reset(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors
    }
  }
}

// Singleton instance for app-wide usage
let singletonInstance: RateLimiter | null = null;

/**
 * Get the singleton rate limiter instance
 * @returns The shared RateLimiter instance
 */
export function getRateLimiter(): RateLimiter {
  if (!singletonInstance) {
    singletonInstance = new RateLimiter();
  }
  return singletonInstance;
}
