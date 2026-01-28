import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Next/);
  });

  test('should display the main heading', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should have deploy and documentation links', async ({ page }) => {
    await page.goto('/');
    const deployLink = page.locator('a:has-text("Deploy Now")');
    const docsLink = page.locator('a:has-text("Documentation")');
    await expect(deployLink).toBeVisible();
    await expect(docsLink).toBeVisible();
  });
});
