import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.describe('Navigation and Page Load', () => {
    test('should load the homepage successfully', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/KnowYourEmoji/);
    });

    test('should have correct URL', async ({ page }) => {
      await page.goto('/');
      expect(page.url()).toContain('/');
    });
  });

  test.describe('Hero Section', () => {
    test('should display the main heading', async ({ page }) => {
      await page.goto('/');
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toHaveText('Know Your Emoji');
    });

    test('should display hero description', async ({ page }) => {
      await page.goto('/');
      const description = page.locator('text=Discover the real meaning behind emojis');
      await expect(description).toBeVisible();
    });

    test('should have main CTA buttons in hero', async ({ page }) => {
      await page.goto('/');
      // Check for interpreter CTA link
      const interpreterLink = page.locator('a:has-text("Interpret a Message")');
      await expect(interpreterLink).toBeVisible();
      await expect(interpreterLink).toHaveAttribute('href', '/interpreter');

      // Check for browse emojis link
      const browseLink = page.locator('a:has-text("Browse All Emojis")');
      await expect(browseLink).toBeVisible();
      await expect(browseLink).toHaveAttribute('href', '/emoji');
    });

    test('should navigate to interpreter page from hero CTA', async ({ page }) => {
      await page.goto('/');
      await page.click('a:has-text("Interpret a Message")');
      await expect(page).toHaveURL('/interpreter');
    });

    test('should navigate to emoji page from hero CTA', async ({ page }) => {
      await page.goto('/');
      await page.click('a:has-text("Browse All Emojis")');
      await expect(page).toHaveURL('/emoji');
    });
  });

  test.describe('Features Section', () => {
    test('should display features heading', async ({ page }) => {
      await page.goto('/');
      const featuresHeading = page.locator('h2:has-text("Features")');
      await expect(featuresHeading).toBeVisible();
    });

    test('should display all three feature cards', async ({ page }) => {
      await page.goto('/');
      // Context-Aware feature
      const contextFeature = page.locator('text=Context-Aware');
      await expect(contextFeature).toBeVisible();

      // Generation Guide feature
      const generationFeature = page.locator('text=Generation Guide');
      await expect(generationFeature).toBeVisible();

      // AI Interpret feature
      const aiFeature = page.locator('text=AI Interpret');
      await expect(aiFeature).toBeVisible();
    });
  });

  test.describe('Popular Emojis Section', () => {
    test('should display popular emojis heading', async ({ page }) => {
      await page.goto('/');
      const heading = page.locator('h2:has-text("Popular Emojis")');
      await expect(heading).toBeVisible();
    });

    test('should display emoji count text', async ({ page }) => {
      await page.goto('/');
      const emojiCount = page.locator('text=/Explore \\d+ emoji meanings/');
      await expect(emojiCount).toBeVisible();
    });

    test('should display emoji cards', async ({ page }) => {
      await page.goto('/');
      const emojiCards = page.locator('[data-testid="emoji-card"]');
      const count = await emojiCards.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(6);
    });

    test('should navigate to emoji detail page when clicking emoji card', async ({ page }) => {
      await page.goto('/');
      const firstEmojiCard = page.locator('[data-testid="emoji-card"]').first();
      await firstEmojiCard.click();
      await expect(page).toHaveURL(/\/emoji\/.+/);
    });

    test('should have View All Emojis button', async ({ page }) => {
      await page.goto('/');
      const viewAllButton = page.locator('a:has-text("View All Emojis")');
      await expect(viewAllButton).toBeVisible();
      await expect(viewAllButton).toHaveAttribute('href', '/emoji');
    });
  });

  test.describe('Popular Combos Section', () => {
    test('should display popular combos heading', async ({ page }) => {
      await page.goto('/');
      const heading = page.locator('h2:has-text("Popular Emoji Combos")');
      await expect(heading).toBeVisible();
    });

    test('should display combo count text', async ({ page }) => {
      await page.goto('/');
      const comboCount = page.locator('text=/Discover \\d+ emoji combination meanings/');
      await expect(comboCount).toBeVisible();
    });

    test('should display combo cards', async ({ page }) => {
      await page.goto('/');
      const comboCards = page.locator('[data-testid="combo-card"]');
      const count = await comboCards.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(4);
    });

    test('should navigate to combo detail page when clicking combo card', async ({ page }) => {
      await page.goto('/');
      const firstComboCard = page.locator('[data-testid="combo-card"]').first();
      await firstComboCard.click();
      await expect(page).toHaveURL(/\/combo\/.+/);
    });

    test('should have View All Combos button', async ({ page }) => {
      await page.goto('/');
      const viewAllButton = page.locator('a:has-text("View All Combos")');
      await expect(viewAllButton).toBeVisible();
      await expect(viewAllButton).toHaveAttribute('href', '/combo');
    });
  });

  test.describe('Final CTA Section', () => {
    test('should display final CTA heading', async ({ page }) => {
      await page.goto('/');
      const heading = page.locator('h2:has-text("Ready to Decode Your Messages?")');
      await expect(heading).toBeVisible();
    });

    test('should have Try the Interpreter button', async ({ page }) => {
      await page.goto('/');
      const ctaButton = page.locator('a:has-text("Try the Interpreter")');
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toHaveAttribute('href', '/interpreter');
    });

    test('should navigate to interpreter from final CTA', async ({ page }) => {
      await page.goto('/');
      const ctaButton = page.locator('a:has-text("Try the Interpreter")');
      await ctaButton.click();
      await expect(page).toHaveURL('/interpreter');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      // Check h1 exists
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);

      // Check h2 elements exist
      const h2s = page.locator('h2');
      expect(await h2s.count()).toBeGreaterThanOrEqual(4);
    });

    test('should have accessible links with aria-labels', async ({ page }) => {
      await page.goto('/');
      // Emoji cards should have aria-labels
      const emojiLinks = page.locator('[data-testid="emoji-card"]').locator('xpath=..');
      const firstLink = emojiLinks.first();
      await expect(firstLink).toHaveAttribute('aria-label', /.+/);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Hero should be visible
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      // CTA buttons should be visible
      const interpreterLink = page.locator('a:has-text("Interpret a Message")');
      await expect(interpreterLink).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      // All sections should be visible
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      const featuresHeading = page.locator('h2:has-text("Features")');
      await expect(featuresHeading).toBeVisible();
    });
  });
});
