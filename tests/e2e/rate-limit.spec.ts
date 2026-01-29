import { test, expect } from '@playwright/test';

// Helper to check if running on webkit-based browsers
const isWebkit = (browserName: string) =>
  browserName === 'webkit' || browserName === 'mobile-safari';

// Rate limit storage key (matches src/lib/rate-limit.ts)
const STORAGE_KEY = 'kye_rate_limit';

test.describe('Rate Limit Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear rate limit storage before each test
    await page.goto('/interpreter');
    await page.evaluate((key) => {
      localStorage.removeItem(key);
    }, STORAGE_KEY);
    // Reload to reset the component state
    await page.reload();
  });

  test.describe('Initial State', () => {
    test('should display full usage counter initially', async ({ page }) => {
      await page.goto('/interpreter');
      const usageCounter = page.locator('[data-testid="usage-counter"]');
      await expect(usageCounter).toBeVisible();
      await expect(usageCounter).toContainText('3 of 3');
      await expect(usageCounter).toContainText('free uses remaining');
    });

    test('should not show upgrade prompt initially', async ({ page }) => {
      await page.goto('/interpreter');
      const upgradePrompt = page.locator('[data-testid="upgrade-prompt"]');
      await expect(upgradePrompt).not.toBeVisible();
    });

    test('should have submit button enabled initially', async ({ page }) => {
      await page.goto('/interpreter');
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Usage Tracking', () => {
    // Skip on webkit - API mocking is not reliable
    test.beforeEach(({ browserName }) => {
      test.skip(isWebkit(browserName), 'API route mocking is not reliable on webkit browsers');
    });

    test('should decrement usage counter after successful interpretation', async ({ page }) => {
      // Mock the streaming API endpoint
      await page.route('/api/interpret/stream', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'text/plain',
          body: 'This is a friendly greeting with emojis.',
        });
      });

      await page.goto('/interpreter');

      // Verify initial state
      const usageCounter = page.locator('[data-testid="usage-counter"]');
      await expect(usageCounter).toContainText('3 of 3');

      // Fill and submit form
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hey there! 👋 How are you? 😊');

      await page.locator('button[role="combobox"]').click();
      await page.locator('[role="option"]:has-text("iMessage")').click();

      await page.locator('button[role="radio"]').first().click();

      await page.locator('button[type="submit"]').click();

      // Wait for interpretation to complete
      const streamingResult = page.locator('[data-testid="streaming-result"]');
      await expect(streamingResult).toBeVisible();
      await expect(page.locator('[data-testid="streaming-text"]')).toContainText(
        'friendly greeting'
      );

      // Wait for the reset button to appear (interpretation complete)
      const resetButton = page.locator('[data-testid="reset-button"]');
      await expect(resetButton).toBeVisible({ timeout: 5000 });

      // Verify usage counter decremented
      await expect(usageCounter).toContainText('2 of 3');
    });

    test('should show warning color when 1 use remaining', async ({ page }) => {
      // Set up rate limit with 2 uses already consumed
      await page.evaluate((key) => {
        const today = new Date().toDateString();
        localStorage.setItem(key, JSON.stringify({ count: 2, date: today }));
      }, STORAGE_KEY);

      await page.goto('/interpreter');

      const usageCounter = page.locator('[data-testid="usage-counter"]');
      await expect(usageCounter).toContainText('1 of 3');
      await expect(usageCounter).toHaveClass(/text-yellow-600/);
    });
  });

  test.describe('Rate Limit Reached', () => {
    test.beforeEach(async ({ page }) => {
      // Set up rate limit as exhausted
      await page.goto('/interpreter');
      await page.evaluate((key) => {
        const today = new Date().toDateString();
        localStorage.setItem(key, JSON.stringify({ count: 3, date: today }));
      }, STORAGE_KEY);
      // Reload to apply the rate limit
      await page.reload();
    });

    test('should show zero remaining uses', async ({ page }) => {
      const usageCounter = page.locator('[data-testid="usage-counter"]');
      await expect(usageCounter).toContainText('0 of 3');
    });

    test('should show usage counter in red when exhausted', async ({ page }) => {
      const usageCounter = page.locator('[data-testid="usage-counter"]');
      await expect(usageCounter).toHaveClass(/text-red-600/);
    });

    test('should display upgrade prompt', async ({ page }) => {
      const upgradePrompt = page.locator('[data-testid="upgrade-prompt"]');
      await expect(upgradePrompt).toBeVisible();
    });

    test('should show daily limit reached message', async ({ page }) => {
      const upgradePrompt = page.locator('[data-testid="upgrade-prompt"]');
      await expect(upgradePrompt).toContainText('Daily Limit Reached');
      await expect(upgradePrompt).toContainText('You have used all 3 free interpretations');
    });

    test('should show reset countdown', async ({ page }) => {
      const resetCountdown = page.locator('[data-testid="reset-countdown"]');
      await expect(resetCountdown).toBeVisible();
      // Countdown should mention hours, minutes, or "soon"
      await expect(resetCountdown).toContainText(/Resets (in \d+ hour|in \d+ minute|soon)/);
    });

    test('should show upgrade button with link to pricing', async ({ page }) => {
      const upgradeButton = page.locator('a:has-text("Upgrade for Unlimited")');
      await expect(upgradeButton).toBeVisible();
      await expect(upgradeButton).toHaveAttribute('href', '/pricing');
    });

    test('should disable submit button when rate limited', async ({ page }) => {
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    });

    test('should keep form fields enabled for viewing', async ({ page }) => {
      // Form fields should still be viewable even when rate limited
      const textarea = page.locator('textarea[name="message"]');
      await expect(textarea).not.toBeDisabled();
    });
  });

  test.describe('Exhausting Free Uses', () => {
    // Skip on webkit - API mocking is not reliable
    test.beforeEach(({ browserName }) => {
      test.skip(isWebkit(browserName), 'API route mocking is not reliable on webkit browsers');
    });

    test('should show upgrade prompt after exhausting all free uses', async ({ page }) => {
      // Start with 2 uses consumed
      await page.evaluate((key) => {
        const today = new Date().toDateString();
        localStorage.setItem(key, JSON.stringify({ count: 2, date: today }));
      }, STORAGE_KEY);

      // Mock the streaming API endpoint
      await page.route('/api/interpret/stream', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'text/plain',
          body: 'Final interpretation result.',
        });
      });

      await page.goto('/interpreter');

      // Verify we have 1 use remaining
      const usageCounter = page.locator('[data-testid="usage-counter"]');
      await expect(usageCounter).toContainText('1 of 3');

      // Use the last interpretation
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Last message 👋 with emoji 😊');

      await page.locator('button[role="combobox"]').click();
      await page.locator('[role="option"]:has-text("iMessage")').click();

      await page.locator('button[role="radio"]').first().click();

      await page.locator('button[type="submit"]').click();

      // Wait for completion
      const resetButton = page.locator('[data-testid="reset-button"]');
      await expect(resetButton).toBeVisible({ timeout: 5000 });

      // Verify upgrade prompt appears
      const upgradePrompt = page.locator('[data-testid="upgrade-prompt"]');
      await expect(upgradePrompt).toBeVisible();
      await expect(upgradePrompt).toContainText('Daily Limit Reached');

      // Verify usage counter shows 0
      await expect(usageCounter).toContainText('0 of 3');

      // Verify submit button is now disabled
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Rate Limit Reset', () => {
    test('should reset rate limit on new day', async ({ page }) => {
      // Set up rate limit from yesterday (expired)
      await page.goto('/interpreter');
      await page.evaluate((key) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        localStorage.setItem(key, JSON.stringify({ count: 3, date: yesterday.toDateString() }));
      }, STORAGE_KEY);

      await page.reload();

      // Should have full uses again since it's a new day
      const usageCounter = page.locator('[data-testid="usage-counter"]');
      await expect(usageCounter).toContainText('3 of 3');

      // Upgrade prompt should not be visible
      const upgradePrompt = page.locator('[data-testid="upgrade-prompt"]');
      await expect(upgradePrompt).not.toBeVisible();

      // Submit button should be enabled
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible usage counter', async ({ page }) => {
      await page.goto('/interpreter');
      const usageCounter = page.locator('[data-testid="usage-counter"]');
      await expect(usageCounter).toHaveAttribute('role', 'status');
      await expect(usageCounter).toHaveAttribute('aria-live', 'polite');
      await expect(usageCounter).toHaveAttribute('aria-label', /\d+ of \d+ free uses remaining/);
    });

    test('should have accessible upgrade prompt when rate limited', async ({ page }) => {
      // Set up exhausted rate limit
      await page.evaluate((key) => {
        const today = new Date().toDateString();
        localStorage.setItem(key, JSON.stringify({ count: 3, date: today }));
      }, STORAGE_KEY);

      await page.goto('/interpreter');

      const upgradePrompt = page.locator('[data-testid="upgrade-prompt"]');
      await expect(upgradePrompt).toBeVisible();

      // Upgrade link should be accessible
      const upgradeLink = upgradePrompt.locator('a');
      await expect(upgradeLink).toBeVisible();
      await expect(upgradeLink).toHaveAttribute('href', '/pricing');
    });
  });

  test.describe('Responsive Design', () => {
    test('should display rate limit UI correctly on mobile', async ({ page }) => {
      // Set up rate limit at 1 remaining
      await page.evaluate((key) => {
        const today = new Date().toDateString();
        localStorage.setItem(key, JSON.stringify({ count: 2, date: today }));
      }, STORAGE_KEY);

      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/interpreter');

      // Usage counter should be visible
      const usageCounter = page.locator('[data-testid="usage-counter"]');
      await expect(usageCounter).toBeVisible();
      await expect(usageCounter).toContainText('1 of 3');
    });

    test('should display upgrade prompt correctly on mobile when exhausted', async ({ page }) => {
      // Set up exhausted rate limit
      await page.evaluate((key) => {
        const today = new Date().toDateString();
        localStorage.setItem(key, JSON.stringify({ count: 3, date: today }));
      }, STORAGE_KEY);

      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/interpreter');

      const upgradePrompt = page.locator('[data-testid="upgrade-prompt"]');
      await expect(upgradePrompt).toBeVisible();

      // Upgrade button should be visible and clickable
      const upgradeButton = page.locator('a:has-text("Upgrade for Unlimited")');
      await expect(upgradeButton).toBeVisible();
    });
  });
});
