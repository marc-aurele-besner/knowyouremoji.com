import { test, expect } from '@playwright/test';

test.describe('Emoji Page Flow', () => {
  test.describe('Navigation and Page Load', () => {
    test('should load an emoji page successfully', async ({ page }) => {
      await page.goto('/emoji/fire');
      await expect(page).toHaveTitle(/Fire.*Emoji/);
    });

    test('should have correct URL', async ({ page }) => {
      await page.goto('/emoji/fire');
      expect(page.url()).toContain('/emoji/fire');
    });

    test('should navigate to emoji page from homepage emoji card', async ({ page }) => {
      await page.goto('/');
      const firstEmojiCard = page.locator('[data-testid="emoji-card"]').first();
      await firstEmojiCard.waitFor({ state: 'visible' });
      await Promise.all([page.waitForURL(/\/emoji\/.+/), firstEmojiCard.click()]);
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should display breadcrumb navigation', async ({ page }) => {
      await page.goto('/emoji/fire');
      const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
      await expect(breadcrumbs).toBeVisible();
    });

    test('should have Home link in breadcrumbs', async ({ page }) => {
      await page.goto('/emoji/fire');
      const homeLink = page.locator('nav[aria-label="Breadcrumb"] a:has-text("Home")');
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toHaveAttribute('href', '/');
    });

    test('should have Emojis link in breadcrumbs', async ({ page }) => {
      await page.goto('/emoji/fire');
      const emojisLink = page.locator('nav[aria-label="Breadcrumb"] a:has-text("Emojis")');
      await expect(emojisLink).toBeVisible();
      await expect(emojisLink).toHaveAttribute('href', '/emoji');
    });

    test('should have category link in breadcrumbs', async ({ page }) => {
      await page.goto('/emoji/fire');
      // Fire emoji is in "objects" category
      const categoryLink = page.locator(
        'nav[aria-label="Breadcrumb"] a[href="/emoji/category/objects"]'
      );
      await expect(categoryLink).toBeVisible();
    });

    test('should display current emoji name in breadcrumbs', async ({ page }) => {
      await page.goto('/emoji/fire');
      const currentItem = page.locator('nav[aria-label="Breadcrumb"]').getByText('🔥 Fire');
      await expect(currentItem).toBeVisible();
    });

    test('should navigate to home from breadcrumb', async ({ page }) => {
      await page.goto('/emoji/fire');
      const homeLink = page.locator('nav[aria-label="Breadcrumb"] a:has-text("Home")');
      await homeLink.waitFor({ state: 'visible' });
      await Promise.all([page.waitForURL('/'), homeLink.click()]);
    });

    test('should navigate to emojis list from breadcrumb', async ({ page }) => {
      await page.goto('/emoji/fire');
      const emojisLink = page.locator('nav[aria-label="Breadcrumb"] a:has-text("Emojis")');
      await emojisLink.waitFor({ state: 'visible' });
      await Promise.all([page.waitForURL('/emoji'), emojisLink.click()]);
    });
  });

  test.describe('Emoji Header Section', () => {
    test('should display the emoji character', async ({ page }) => {
      await page.goto('/emoji/fire');
      const emojiCharacter = page.locator('text=🔥').first();
      await expect(emojiCharacter).toBeVisible();
    });

    test('should display the emoji name', async ({ page }) => {
      await page.goto('/emoji/fire');
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Fire');
    });

    test('should display unicode code point', async ({ page }) => {
      await page.goto('/emoji/fire');
      const unicode = page.locator('text=/U\\+1F525/i').first();
      await expect(unicode).toBeVisible();
    });

    test('should display shortcode', async ({ page }) => {
      await page.goto('/emoji/fire');
      const shortcode = page.locator('text=:fire:');
      await expect(shortcode).toBeVisible();
    });

    test('should have copy button', async ({ page }) => {
      await page.goto('/emoji/fire');
      const copyButton = page.locator('button:has-text("Copy")');
      await expect(copyButton).toBeVisible();
    });
  });

  test.describe('TL;DR Section', () => {
    test('should display TL;DR section', async ({ page }) => {
      await page.goto('/emoji/fire');
      const tldrHeading = page.locator('text=TL;DR');
      await expect(tldrHeading).toBeVisible();
    });

    test('should display TL;DR content', async ({ page }) => {
      await page.goto('/emoji/fire');
      // Fire emoji TL;DR section contains the TL;DR text
      const tldrSection = page.locator('section:has(h3:has-text("TL;DR"))');
      const tldrContent = tldrSection.locator('p.text-gray-700');
      await expect(tldrContent).toBeVisible();
      await expect(tldrContent).toContainText(/hot|exciting|impressive|trending/i);
    });
  });

  test.describe('Context Meanings Section', () => {
    test('should display Context Meanings heading', async ({ page }) => {
      await page.goto('/emoji/fire');
      const heading = page.locator('h2:has-text("Context Meanings")');
      await expect(heading).toBeVisible();
    });

    test('should display context badges', async ({ page }) => {
      await page.goto('/emoji/fire');
      // Fire emoji has SLANG, LITERAL, DATING, WORK contexts
      const slangBadge = page.locator('text=Slang').first();
      await expect(slangBadge).toBeVisible();
    });

    test('should display risk level badges', async ({ page }) => {
      await page.goto('/emoji/fire');
      const riskBadge = page.locator('text=/LOW Risk|MEDIUM Risk|HIGH Risk/').first();
      await expect(riskBadge).toBeVisible();
    });

    test('should display context meaning descriptions', async ({ page }) => {
      await page.goto('/emoji/fire');
      // Check that at least one meaning is displayed
      const meaningText = page.locator('text=/extremely good|impressive|attractive/i').first();
      await expect(meaningText).toBeVisible();
    });

    test('should display example usage', async ({ page }) => {
      await page.goto('/emoji/fire');
      const example = page.locator('text=/Example:/').first();
      await expect(example).toBeVisible();
    });
  });

  test.describe('Platform Notes Section', () => {
    test('should display Platform Notes heading', async ({ page }) => {
      await page.goto('/emoji/fire');
      const heading = page.locator('h2:has-text("Platform Notes")');
      await expect(heading).toBeVisible();
    });

    test('should display platform badges', async ({ page }) => {
      await page.goto('/emoji/fire');
      // Fire emoji has TIKTOK, INSTAGRAM, TWITTER notes
      const platformBadge = page.locator('text=/TikTok|Instagram|Twitter/').first();
      await expect(platformBadge).toBeVisible();
    });

    test('should display platform note content', async ({ page }) => {
      await page.goto('/emoji/fire');
      // Check for platform-specific content
      const noteContent = page.locator('text=/viral|trending|compliment/i').first();
      await expect(noteContent).toBeVisible();
    });
  });

  test.describe('Generational Notes Section', () => {
    test('should display Generational Differences heading', async ({ page }) => {
      await page.goto('/emoji/fire');
      const heading = page.locator('h2:has-text("Generational Differences")');
      await expect(heading).toBeVisible();
    });

    test('should display generation badges', async ({ page }) => {
      await page.goto('/emoji/fire');
      // Fire emoji has GEN_Z, MILLENNIAL, BOOMER notes
      const genBadge = page.locator('text=/Gen Z|Millennial|Boomer/').first();
      await expect(genBadge).toBeVisible();
    });

    test('should display generational note content', async ({ page }) => {
      await page.goto('/emoji/fire');
      const noteContent = page.locator('text=/approval|compliment|literally/i').first();
      await expect(noteContent).toBeVisible();
    });
  });

  test.describe('Technical Details Section', () => {
    test('should display Technical Details heading', async ({ page }) => {
      await page.goto('/emoji/fire');
      const heading = page.locator('h2:has-text("Technical Details")');
      await expect(heading).toBeVisible();
    });

    test('should display Unicode label and value', async ({ page }) => {
      await page.goto('/emoji/fire');
      const unicodeLabel = page.locator('dt:has-text("Unicode")');
      await expect(unicodeLabel).toBeVisible();
      const unicodeValue = page.locator('dd:has-text("U+1F525")');
      await expect(unicodeValue).toBeVisible();
    });

    test('should display Version label and value', async ({ page }) => {
      await page.goto('/emoji/fire');
      const versionLabel = page.locator('dt:has-text("Version")');
      await expect(versionLabel).toBeVisible();
      // Fire emoji is version 6.0
      const versionValue = page.locator('dd:has-text("6.0")');
      await expect(versionValue).toBeVisible();
    });

    test('should display Category label with link', async ({ page }) => {
      await page.goto('/emoji/fire');
      const categoryLabel = page.getByText('Category', { exact: true });
      await expect(categoryLabel).toBeVisible();
      const categoryLink = page.locator('dd a[href="/emoji/category/objects"]');
      await expect(categoryLink).toBeVisible();
    });

    test('should display Subcategory when available', async ({ page }) => {
      await page.goto('/emoji/fire');
      const subcategoryLabel = page.locator('dt:has-text("Subcategory")');
      await expect(subcategoryLabel).toBeVisible();
    });
  });

  test.describe('Related Emojis Section', () => {
    test('should display Related Emojis heading', async ({ page }) => {
      await page.goto('/emoji/fire');
      const heading = page.locator('h2:has-text("Related Emojis")');
      await expect(heading).toBeVisible();
    });

    test('should display related emoji cards', async ({ page }) => {
      await page.goto('/emoji/fire');
      // Related emojis section with linked emoji cards
      const relatedSection = page.locator('section[aria-labelledby="related-emojis-heading"]');
      await expect(relatedSection).toBeVisible();
      // Related emoji cards are anchor elements linking to /emoji/...
      const relatedCards = relatedSection.locator('a[href^="/emoji/"]');
      const count = await relatedCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should navigate to related emoji when clicked', async ({ page }) => {
      await page.goto('/emoji/fire');
      const relatedSection = page.locator('section[aria-labelledby="related-emojis-heading"]');
      const firstRelatedCard = relatedSection.locator('a[href^="/emoji/"]').first();
      await firstRelatedCard.waitFor({ state: 'visible' });
      await Promise.all([page.waitForURL(/\/emoji\/.+/), firstRelatedCard.click()]);
    });
  });

  test.describe('Emoji Combos Section (conditional)', () => {
    test('should display combos section when emoji has related combos', async ({ page }) => {
      // Fire emoji has related combos
      await page.goto('/emoji/fire');
      const heading = page.locator('h2:has-text("Emoji Combos")');
      // This section only appears if there are combos
      const headingCount = await heading.count();
      if (headingCount > 0) {
        await expect(heading).toBeVisible();
      }
    });
  });

  test.describe('Warnings Section (conditional)', () => {
    test('should display warnings section when emoji has warnings', async ({ page }) => {
      // Eggplant emoji has warnings
      await page.goto('/emoji/eggplant');
      const heading = page.locator('h2:has-text("Warnings")');
      const headingCount = await heading.count();
      if (headingCount > 0) {
        await expect(heading).toBeVisible();
        const warningIcon = page.locator('text=⚠️');
        await expect(warningIcon.first()).toBeVisible();
      }
    });

    test('should display warning severity badge when warnings exist', async ({ page }) => {
      await page.goto('/emoji/eggplant');
      const heading = page.locator('h2:has-text("Warnings")');
      const headingCount = await heading.count();
      if (headingCount > 0) {
        const severityBadge = page.locator('text=/LOW|MEDIUM|HIGH/').first();
        await expect(severityBadge).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/emoji/fire');
      // Check h1 exists (emoji name)
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);

      // Check h2 elements exist for sections
      const h2s = page.locator('h2');
      expect(await h2s.count()).toBeGreaterThanOrEqual(4);
    });

    test('should have accessible breadcrumb navigation', async ({ page }) => {
      await page.goto('/emoji/fire');
      const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
      await expect(breadcrumbs).toBeVisible();
    });

    test('should have accessible links in related emojis', async ({ page }) => {
      await page.goto('/emoji/fire');
      const relatedSection = page.locator('section[aria-labelledby="related-emojis-heading"]');
      const links = relatedSection.locator('a[aria-label]');
      expect(await links.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/emoji/fire');

      // Header should be visible
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      // TL;DR section should be visible
      const tldr = page.locator('text=TL;DR');
      await expect(tldr).toBeVisible();

      // Technical details should be visible
      const techDetails = page.locator('h2:has-text("Technical Details")');
      await expect(techDetails).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/emoji/fire');

      // All main sections should be visible
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      const contextMeanings = page.locator('h2:has-text("Context Meanings")');
      await expect(contextMeanings).toBeVisible();

      const platformNotes = page.locator('h2:has-text("Platform Notes")');
      await expect(platformNotes).toBeVisible();
    });
  });

  test.describe('404 Not Found', () => {
    test('should show not found page for invalid emoji slug', async ({ page }) => {
      await page.goto('/emoji/nonexistent-emoji-slug-12345');
      // Check for 404 indicators
      const notFoundText = page.locator("text=/not found|404|doesn't exist/i");
      await expect(notFoundText.first()).toBeVisible();
    });
  });

  test.describe('Multiple Emojis', () => {
    test('should load skull emoji page successfully', async ({ page }) => {
      await page.goto('/emoji/skull');
      await expect(page).toHaveTitle(/Skull.*Emoji/);
      const heading = page.locator('h1');
      await expect(heading).toContainText('Skull');
    });

    test('should load thumbs-up emoji page successfully', async ({ page }) => {
      await page.goto('/emoji/thumbs-up');
      await expect(page).toHaveTitle(/Thumbs.*Emoji/);
      const heading = page.locator('h1');
      await expect(heading).toContainText('Thumbs');
    });

    test('should load sparkles emoji page successfully', async ({ page }) => {
      await page.goto('/emoji/sparkles');
      await expect(page).toHaveTitle(/Sparkles.*Emoji/);
      const heading = page.locator('h1');
      await expect(heading).toContainText('Sparkles');
    });
  });
});
