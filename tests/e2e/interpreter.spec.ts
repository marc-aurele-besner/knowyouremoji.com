import { test, expect } from '@playwright/test';

// Helper to check if running on webkit-based browsers
const isWebkit = (browserName: string) =>
  browserName === 'webkit' || browserName === 'mobile-safari';

test.describe('Interpreter Flow', () => {
  test.describe('Navigation and Page Load', () => {
    test('should load the interpreter page successfully', async ({ page }) => {
      await page.goto('/interpreter');
      await expect(page).toHaveTitle(/Interpreter/);
    });

    test('should have correct URL', async ({ page }) => {
      await page.goto('/interpreter');
      expect(page.url()).toContain('/interpreter');
    });

    test('should navigate to interpreter from homepage CTA', async ({ page }) => {
      await page.goto('/');
      const interpreterLink = page.locator('a:has-text("Interpret a Message")');
      await interpreterLink.waitFor({ state: 'visible' });
      await Promise.all([page.waitForURL('/interpreter'), interpreterLink.click()]);
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should display breadcrumb navigation', async ({ page }) => {
      await page.goto('/interpreter');
      const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
      await expect(breadcrumbs).toBeVisible();
    });

    test('should have Home link in breadcrumbs', async ({ page }) => {
      await page.goto('/interpreter');
      const homeLink = page.locator('nav[aria-label="Breadcrumb"] a:has-text("Home")');
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toHaveAttribute('href', '/');
    });

    test('should display Interpreter in breadcrumbs', async ({ page }) => {
      await page.goto('/interpreter');
      const currentItem = page.locator('nav[aria-label="Breadcrumb"]').getByText('Interpreter');
      await expect(currentItem).toBeVisible();
    });

    test('should navigate to home from breadcrumb', async ({ page }) => {
      await page.goto('/interpreter');
      const homeLink = page.locator('nav[aria-label="Breadcrumb"] a:has-text("Home")');
      await homeLink.waitFor({ state: 'visible' });
      await Promise.all([page.waitForURL('/'), homeLink.click()]);
    });
  });

  test.describe('Header Section', () => {
    test('should display the page heading', async ({ page }) => {
      await page.goto('/interpreter');
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toHaveText('Emoji Interpreter');
    });

    test('should display page description', async ({ page }) => {
      await page.goto('/interpreter');
      const description = page.locator('text=Paste a message with emojis');
      await expect(description).toBeVisible();
    });
  });

  test.describe('Interpreter Form', () => {
    test('should display interpreter form section', async ({ page }) => {
      await page.goto('/interpreter');
      const formSection = page.locator('[data-testid="interpreter-form-section"]');
      await expect(formSection).toBeVisible();
    });

    test('should display message textarea', async ({ page }) => {
      await page.goto('/interpreter');
      const textarea = page.locator('textarea[name="message"]');
      await expect(textarea).toBeVisible();
      await expect(textarea).toHaveAttribute(
        'placeholder',
        'Paste or type the message you want to decode... (must include emojis)'
      );
    });

    test('should display character counter', async ({ page }) => {
      await page.goto('/interpreter');
      const charCounter = page.locator('[data-testid="char-counter"]');
      await expect(charCounter).toBeVisible();
      await expect(charCounter).toHaveText('0 / 1000');
    });

    test('should update character counter when typing', async ({ page, browserName }) => {
      // Skip on webkit - emoji character counting behaves differently
      test.skip(isWebkit(browserName), 'Emoji character counting differs on webkit');

      await page.goto('/interpreter');
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hello 👋');
      const charCounter = page.locator('[data-testid="char-counter"]');
      await expect(charCounter).toHaveText('8 / 1000');
    });

    test('should display platform selector', async ({ page }) => {
      await page.goto('/interpreter');
      const platformLabel = page.locator('label#platform-label');
      await expect(platformLabel).toBeVisible();
      await expect(platformLabel).toHaveText('Platform');
    });

    test('should display context selector', async ({ page }) => {
      await page.goto('/interpreter');
      const contextLabel = page.locator('label#context-label');
      await expect(contextLabel).toBeVisible();
      await expect(contextLabel).toHaveText('Relationship context');
    });

    test('should display submit button', async ({ page }) => {
      await page.goto('/interpreter');
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveText('Interpret Message');
    });

    test('should display usage counter', async ({ page }) => {
      await page.goto('/interpreter');
      // Usage counter should be visible showing remaining uses
      const usageCounter = page.locator('text=/\\d+.*remaining|\\d+.*left|\\d+\\/\\d+/i');
      await expect(usageCounter.first()).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should show error for empty message', async ({ page }) => {
      await page.goto('/interpreter');

      // Try to submit without filling the form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show message error
      const messageError = page
        .locator('role=alert')
        .filter({ hasText: /at least 10 characters/i });
      await expect(messageError).toBeVisible();
    });

    test('should show error for message without emoji', async ({ page, browserName }) => {
      // Skip on webkit - dropdown interactions are flaky
      test.skip(isWebkit(browserName), 'Dropdown interactions are flaky on webkit');

      await page.goto('/interpreter');

      // Fill message without emoji
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hello world, this is a test message without emojis');

      // Select platform and context
      await page.locator('button[role="combobox"]').click();
      await page.locator('[role="option"]:has-text("iMessage")').click();

      await page.locator('button[role="radio"]').first().click();

      // Try to submit
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show emoji error
      const emojiError = page.locator('role=alert').filter({ hasText: /must contain.*emoji/i });
      await expect(emojiError).toBeVisible();
    });

    test('should show error for missing platform', async ({ page }) => {
      await page.goto('/interpreter');

      // Fill message with emoji
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hello 👋 how are you doing today?');

      // Select context but not platform
      await page.locator('button[role="radio"]').first().click();

      // Try to submit
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show platform error
      const platformError = page.locator('role=alert').filter({ hasText: /select a platform/i });
      await expect(platformError).toBeVisible();
    });

    test('should show error for missing context', async ({ page }) => {
      await page.goto('/interpreter');

      // Fill message with emoji
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hello 👋 how are you doing today?');

      // Select platform but not context
      await page.locator('button[role="combobox"]').click();
      await page.locator('[role="option"]:has-text("iMessage")').click();

      // Try to submit
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show context error
      const contextError = page.locator('role=alert').filter({ hasText: /select.*context/i });
      await expect(contextError).toBeVisible();
    });

    test('should clear errors when valid input is provided', async ({ page }) => {
      await page.goto('/interpreter');

      // Submit empty form to trigger errors
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Verify error is shown
      const messageError = page
        .locator('role=alert')
        .filter({ hasText: /at least 10 characters/i });
      await expect(messageError).toBeVisible();

      // Fill valid message
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hello 👋 how are you doing today?');

      // Error should be cleared
      await expect(messageError).not.toBeVisible();
    });
  });

  test.describe('Form Submission with Mocked API', () => {
    // Skip entire describe block on webkit - page.route() for API mocking doesn't work reliably
    test.beforeEach(({ browserName }) => {
      test.skip(isWebkit(browserName), 'API route mocking is not reliable on webkit browsers');
    });

    test('should submit form and display streaming result', async ({ page }) => {
      // Mock the streaming API endpoint
      await page.route('/api/interpret/stream', async (route) => {
        const body =
          'This message contains a friendly wave emoji 👋 which typically indicates a casual greeting. The tone is warm and inviting.';

        await route.fulfill({
          status: 200,
          contentType: 'text/plain',
          body: body,
        });
      });

      await page.goto('/interpreter');

      // Fill the form
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hey! 👋 How are you doing today? 😊');

      // Select platform
      await page.locator('button[role="combobox"]').click();
      await page.locator('[role="option"]:has-text("iMessage")').click();

      // Select context (first radio option - Romantic Partner)
      await page.locator('button[role="radio"]').first().click();

      // Submit the form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Verify streaming result appears
      const streamingResult = page.locator('[data-testid="streaming-result"]');
      await expect(streamingResult).toBeVisible();

      // Verify the interpretation text is displayed
      const streamingText = page.locator('[data-testid="streaming-text"]');
      await expect(streamingText).toBeVisible();
      await expect(streamingText).toContainText('friendly wave emoji');
    });

    test('should show interpreting state while loading', async ({ page }) => {
      // Mock a slow API response
      await page.route('/api/interpret/stream', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'text/plain',
          body: 'Interpretation complete.',
        });
      });

      await page.goto('/interpreter');

      // Fill the form
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hey! 👋 How are you doing today? 😊');

      // Select platform
      await page.locator('button[role="combobox"]').click();
      await page.locator('[role="option"]:has-text("iMessage")').click();

      // Select context
      await page.locator('button[role="radio"]').first().click();

      // Submit the form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show loading state
      const loadingHeader = page.locator('text=Interpreting...');
      await expect(loadingHeader).toBeVisible();

      // Button should be disabled during loading
      await expect(submitButton).toBeDisabled();
    });

    test('should display stop button during loading', async ({ page }) => {
      // Mock a slow API response
      await page.route('/api/interpret/stream', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'text/plain',
          body: 'Interpretation complete.',
        });
      });

      await page.goto('/interpreter');

      // Fill the form
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hey! 👋 How are you doing today? 😊');

      // Select platform
      await page.locator('button[role="combobox"]').click();
      await page.locator('[role="option"]:has-text("iMessage")').click();

      // Select context
      await page.locator('button[role="radio"]').first().click();

      // Submit the form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should show stop button during loading
      const stopButton = page.locator('[data-testid="stop-button"]');
      await expect(stopButton).toBeVisible();
    });

    test('should display clear button after completion', async ({ page }) => {
      // Mock the API response
      await page.route('/api/interpret/stream', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'text/plain',
          body: 'Interpretation complete.',
        });
      });

      await page.goto('/interpreter');

      // Fill the form
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hey! 👋 How are you doing today? 😊');

      // Select platform
      await page.locator('button[role="combobox"]').click();
      await page.locator('[role="option"]:has-text("iMessage")').click();

      // Select context
      await page.locator('button[role="radio"]').first().click();

      // Submit the form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for completion and verify clear button
      const resetButton = page.locator('[data-testid="reset-button"]');
      await expect(resetButton).toBeVisible({ timeout: 5000 });
    });

    test('should clear result when reset button is clicked', async ({ page }) => {
      // Mock the API response
      await page.route('/api/interpret/stream', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'text/plain',
          body: 'Interpretation complete.',
        });
      });

      await page.goto('/interpreter');

      // Fill the form
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hey! 👋 How are you doing today? 😊');

      // Select platform
      await page.locator('button[role="combobox"]').click();
      await page.locator('[role="option"]:has-text("iMessage")').click();

      // Select context
      await page.locator('button[role="radio"]').first().click();

      // Submit the form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for completion
      const resetButton = page.locator('[data-testid="reset-button"]');
      await expect(resetButton).toBeVisible({ timeout: 5000 });

      // Click reset button
      await resetButton.click();

      // Result section should be hidden
      const streamingResult = page.locator('[data-testid="streaming-result"]');
      await expect(streamingResult).not.toBeVisible();
    });

    test('should handle API error gracefully', async ({ page }) => {
      // Mock an error response
      await page.route('/api/interpret/stream', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      await page.goto('/interpreter');

      // Fill the form
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hey! 👋 How are you doing today? 😊');

      // Select platform
      await page.locator('button[role="combobox"]').click();
      await page.locator('[role="option"]:has-text("iMessage")').click();

      // Select context
      await page.locator('button[role="radio"]').first().click();

      // Submit the form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Should display error message
      const errorElement = page.locator('[data-testid="streaming-error"]');
      await expect(errorElement).toBeVisible({ timeout: 5000 });
    });

    test('should allow retry after error', async ({ page }) => {
      let requestCount = 0;

      // First request fails, second succeeds
      await page.route('/api/interpret/stream', async (route) => {
        requestCount++;
        if (requestCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Internal server error' }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'text/plain',
            body: 'Success on retry!',
          });
        }
      });

      await page.goto('/interpreter');

      // Fill the form
      const textarea = page.locator('textarea[name="message"]');
      await textarea.fill('Hey! 👋 How are you doing today? 😊');

      // Select platform
      await page.locator('button[role="combobox"]').click();
      await page.locator('[role="option"]:has-text("iMessage")').click();

      // Select context
      await page.locator('button[role="radio"]').first().click();

      // Submit the form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Wait for error
      const errorElement = page.locator('[data-testid="streaming-error"]');
      await expect(errorElement).toBeVisible({ timeout: 5000 });

      // Click Try Again button
      const tryAgainButton = page.locator('button:has-text("Try Again")');
      await tryAgainButton.click();

      // Error should be cleared and ready for new submission
      await expect(errorElement).not.toBeVisible();
    });
  });

  test.describe('Platform and Context Selection', () => {
    test('should allow selecting different platforms', async ({ page }) => {
      await page.goto('/interpreter');

      // Open platform dropdown
      await page.locator('button[role="combobox"]').click();

      // Should show platform options
      const platforms = [
        'iMessage',
        'Instagram',
        'TikTok',
        'WhatsApp',
        'Slack',
        'Discord',
        'Twitter/X',
        'Other',
      ];

      for (const platform of platforms) {
        const option = page.locator(`[role="option"]:has-text("${platform}")`);
        await expect(option).toBeVisible();
      }

      // Select Instagram
      await page.locator('[role="option"]:has-text("Instagram")').click();

      // Dropdown should close and show selection
      const combobox = page.locator('button[role="combobox"]');
      await expect(combobox).toContainText('Instagram');
    });

    test('should allow selecting different contexts', async ({ page }) => {
      await page.goto('/interpreter');

      // Context options should be visible as radio buttons (styled as button elements)
      const contexts = [
        'Romantic Partner',
        'Friend',
        'Family Member',
        'Coworker/Professional',
        'Acquaintance',
        'Unknown/Stranger',
      ];

      for (const context of contexts) {
        const radioButton = page.locator(`button[role="radio"]:has-text("${context}")`);
        await expect(radioButton).toBeVisible();
      }

      // Select a context (Friend)
      const friendRadio = page.locator('button[role="radio"]:has-text("Friend")').first();
      await friendRadio.click();
      await expect(friendRadio).toHaveAttribute('aria-checked', 'true');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/interpreter');
      // Check h1 exists
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
    });

    test('should have accessible form elements', async ({ page }) => {
      await page.goto('/interpreter');

      // Textarea should have label
      const textarea = page.locator('textarea[name="message"]');
      await expect(textarea).toHaveAttribute('id', 'message');

      const label = page.locator('label[for="message"]');
      await expect(label).toBeVisible();
    });

    test('should have accessible breadcrumb navigation', async ({ page }) => {
      await page.goto('/interpreter');
      const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
      await expect(breadcrumbs).toBeVisible();
    });

    test('should show validation errors with role=alert', async ({ page }) => {
      await page.goto('/interpreter');

      // Submit empty form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Error should have role=alert for screen readers
      const alerts = page.locator('role=alert');
      const count = await alerts.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/interpreter');

      // Header should be visible
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      // Form should be visible
      const textarea = page.locator('textarea[name="message"]');
      await expect(textarea).toBeVisible();

      // Submit button should be visible
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/interpreter');

      // All main elements should be visible
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      const formSection = page.locator('[data-testid="interpreter-form-section"]');
      await expect(formSection).toBeVisible();
    });
  });
});
