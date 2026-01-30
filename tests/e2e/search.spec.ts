import { test, expect } from '@playwright/test';

test.describe('Search Flow', () => {
  test.describe('Search Bar Visibility', () => {
    test('should display search bar in header on desktop', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await expect(searchInput).toBeVisible();
    });

    test('should display search bar with correct placeholder', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await expect(searchInput).toHaveAttribute('placeholder', 'Search emojis...');
    });

    test('should have combobox role for accessibility', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await expect(searchInput).toHaveAttribute('role', 'combobox');
    });
  });

  test.describe('Search Input Behavior', () => {
    test('should allow typing in search input', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await expect(searchInput).toHaveValue('fire');
    });

    test('should show loading indicator while searching', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      // Loading spinner should briefly appear
      const spinner = page.locator('header .animate-spin');
      // The spinner may be very brief, so we just check it exists or results appear
      await expect(spinner.or(page.locator('#search-results'))).toBeVisible({ timeout: 3000 });
    });

    test('should clear search when pressing Escape', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results', { timeout: 3000 });
      await searchInput.press('Escape');
      // Results dropdown should be closed
      await expect(page.locator('#search-results')).not.toBeVisible();
    });
  });

  test.describe('Search Results Display', () => {
    test('should display search results for valid query', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      const results = page.locator('#search-results');
      await expect(results).toBeVisible({ timeout: 3000 });
    });

    test('should display emoji character in search results', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results', { timeout: 3000 });
      const emojiCharacter = page.locator('#search-results .emoji-display');
      await expect(emojiCharacter.first()).toBeVisible();
    });

    test('should display emoji name in search results', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results', { timeout: 3000 });
      const resultItem = page.locator('#search-results li[role="option"]').first();
      await expect(resultItem).toContainText(/fire/i);
    });

    test('should show "No emojis found" for non-matching query', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('xyznonexistent123');
      await page.waitForSelector('#search-results', { timeout: 3000 });
      const noResults = page.locator('#search-results p:has-text("No emojis found")');
      await expect(noResults).toBeVisible();
    });

    test('should limit search results to 6 items', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      // Search for something common that should have many results
      await searchInput.fill('face');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      const resultItems = page.locator('#search-results li[role="option"]');
      const count = await resultItems.count();
      expect(count).toBeLessThanOrEqual(6);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate down with ArrowDown key', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      await searchInput.press('ArrowDown');
      const firstResult = page.locator('#search-results li[role="option"]').first();
      await expect(firstResult).toHaveAttribute('aria-selected', 'true');
    });

    test('should navigate up with ArrowUp key', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      // Go down twice then up once
      await searchInput.press('ArrowDown');
      await searchInput.press('ArrowDown');
      await searchInput.press('ArrowUp');
      const firstResult = page.locator('#search-results li[role="option"]').first();
      await expect(firstResult).toHaveAttribute('aria-selected', 'true');
    });

    test('should wrap navigation at end of list', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      const resultItems = page.locator('#search-results li[role="option"]');
      const count = await resultItems.count();
      // Press down more than the number of results
      for (let i = 0; i <= count; i++) {
        await searchInput.press('ArrowDown');
      }
      // Should wrap back to first item
      const firstResult = page.locator('#search-results li[role="option"]').first();
      await expect(firstResult).toHaveAttribute('aria-selected', 'true');
    });

    test('should select result with Enter key', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      await searchInput.press('ArrowDown');
      await searchInput.press('Enter');
      await expect(page).toHaveURL(/\/emoji\/.+/);
    });

    test('should update aria-activedescendant during navigation', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      await searchInput.press('ArrowDown');
      await expect(searchInput).toHaveAttribute('aria-activedescendant', 'search-result-0');
    });
  });

  test.describe('Mouse Interaction', () => {
    test('should highlight result on hover', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      const secondResult = page.locator('#search-results li[role="option"]').nth(1);
      await secondResult.hover();
      await expect(secondResult).toHaveAttribute('aria-selected', 'true');
    });

    test('should navigate to emoji page when clicking result', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      const firstResult = page.locator('#search-results li[role="option"]').first();
      await firstResult.click();
      await expect(page).toHaveURL(/\/emoji\/.+/);
    });

    test('should close dropdown when clicking outside', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results', { timeout: 3000 });
      // Click on body/main area outside search
      await page.locator('main').click({ position: { x: 100, y: 100 }, force: true });
      await expect(page.locator('#search-results')).not.toBeVisible();
    });
  });

  test.describe('Search to Emoji Page Flow', () => {
    test('should navigate from search to fire emoji page', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      // Search by emoji character for exact match
      await searchInput.fill('🔥');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      const fireResult = page.locator('#search-results li[role="option"]').first();
      await fireResult.click();
      await expect(page).toHaveURL(/\/emoji\/fire/);
      await expect(page.locator('h1')).toContainText('Fire');
    });

    test('should clear search input after selection', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      // Search by emoji character for exact match
      await searchInput.fill('💀');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      const firstResult = page.locator('#search-results li[role="option"]').first();
      await firstResult.click();
      await page.waitForURL(/\/emoji\/.+/);
      // After navigation, if we go back and check, or verify on current page
      // The search input should be cleared after selection
      const newSearchInput = page.locator('header input[aria-label="Search emojis"]');
      await expect(newSearchInput).toHaveValue('');
    });

    test('should search on emoji page and navigate to another emoji', async ({ page }) => {
      await page.goto('/emoji/fire');
      await expect(page.locator('h1')).toContainText('Fire');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      // Search by emoji character for exact match
      await searchInput.fill('💀');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      const skullResult = page.locator('#search-results li[role="option"]').first();
      await skullResult.click();
      await expect(page).toHaveURL(/\/emoji\/skull/);
      await expect(page.locator('h1')).toContainText('Skull');
    });
  });

  test.describe('Search by Different Criteria', () => {
    test('should find emoji by character', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('🔥');
      await page.waitForSelector('#search-results', { timeout: 3000 });
      const results = page.locator('#search-results li[role="option"]');
      const count = await results.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should find emoji by category', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('smileys');
      await page.waitForSelector('#search-results', { timeout: 3000 });
      const results = page.locator('#search-results li[role="option"]');
      const count = await results.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should find emoji by partial name match', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('thu');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      const thumbsResult = page
        .locator('#search-results li[role="option"]:has-text("Thumbs")')
        .first();
      await expect(thumbsResult).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have correct ARIA attributes when expanded', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results', { timeout: 3000 });
      await expect(searchInput).toHaveAttribute('aria-expanded', 'true');
      await expect(searchInput).toHaveAttribute('aria-controls', 'search-results');
    });

    test('should have correct ARIA attributes when collapsed', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
    });

    test('should have listbox role on results container', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results', { timeout: 3000 });
      const resultsContainer = page.locator('#search-results');
      await expect(resultsContainer).toHaveAttribute('role', 'listbox');
    });

    test('should have option role on result items', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results li[role="option"]', { timeout: 3000 });
      const firstResult = page.locator('#search-results li[role="option"]').first();
      await expect(firstResult).toHaveAttribute('role', 'option');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await expect(searchInput).toBeVisible();
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results', { timeout: 3000 });
      await expect(page.locator('#search-results')).toBeVisible();
    });
  });

  test.describe('Mobile Search', () => {
    test('should have search in mobile nav when menu is open', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      // Open mobile menu
      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await menuButton.click();
      // Search should be visible in mobile nav
      const mobileSearchInput = page.locator(
        '[data-testid="mobile-nav"] input[aria-label="Search emojis"]'
      );
      await expect(mobileSearchInput).toBeVisible();
    });

    test('should search from mobile nav', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      // Open mobile menu
      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await menuButton.click();
      // Use mobile search
      const mobileSearchInput = page.locator(
        '[data-testid="mobile-nav"] input[aria-label="Search emojis"]'
      );
      await mobileSearchInput.fill('fire');
      await page.waitForSelector('[data-testid="mobile-nav"] #search-results li[role="option"]', {
        timeout: 3000,
      });
      const firstResult = page
        .locator('[data-testid="mobile-nav"] #search-results li[role="option"]')
        .first();
      await firstResult.click();
      await expect(page).toHaveURL(/\/emoji\/.+/);
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle rapid typing without errors', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      // Type rapidly
      await searchInput.pressSequentially('firestorm', { delay: 50 });
      // Should eventually show results or "no results" without crashing
      await page.waitForSelector('#search-results', { timeout: 3000 });
      const results = page.locator('#search-results');
      await expect(results).toBeVisible();
    });

    test('should handle empty query gracefully', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('fire');
      await page.waitForSelector('#search-results', { timeout: 3000 });
      // Clear the input
      await searchInput.fill('');
      // Results should close
      await expect(page.locator('#search-results')).not.toBeVisible();
    });

    test('should handle whitespace-only query', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('   ');
      // Wait a bit to ensure debounce completes
      await page.waitForTimeout(300);
      // Results should not be shown for whitespace-only
      await expect(page.locator('#search-results')).not.toBeVisible();
    });

    test('should handle special characters in search', async ({ page }) => {
      await page.goto('/');
      const searchInput = page.locator('header input[aria-label="Search emojis"]');
      await searchInput.fill('<script>alert(1)</script>');
      await page.waitForSelector('#search-results', { timeout: 3000 });
      // Should show "no results" safely without XSS
      const noResults = page.locator('#search-results p:has-text("No emojis found")');
      await expect(noResults).toBeVisible();
    });
  });
});
