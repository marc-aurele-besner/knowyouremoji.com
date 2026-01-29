import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/KnowYourEmoji/);
  });

  test('should display the main heading', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should have main CTA links', async ({ page }) => {
    await page.goto('/');
    // Check for interpreter CTA link
    const interpreterLink = page.locator('a:has-text("Interpret a Message")');
    await expect(interpreterLink).toBeVisible();
    // Check for browse emojis link
    const browseLink = page.locator('a:has-text("Browse All Emojis")');
    await expect(browseLink).toBeVisible();
  });
});
