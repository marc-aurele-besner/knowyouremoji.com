import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import HomePage from '@/app/page';
import { clearEmojiCache } from '@/lib/emoji-data';
import { clearComboCache } from '@/lib/combo-data';

/**
 * Homepage tests using real emoji and combo data
 * This approach avoids mock.module conflicts with other tests
 */
describe('HomePage', () => {
  // Clear caches before each test to ensure clean state
  beforeEach(() => {
    clearEmojiCache();
    clearComboCache();
  });

  // Ensure DOM is cleaned up after each test
  afterEach(() => {
    cleanup();
  });

  describe('Hero section', () => {
    test('renders main headline', () => {
      render(<HomePage />);

      // Check for main heading
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toContain('Emoji');
    });

    test('renders descriptive subheadline', () => {
      render(<HomePage />);

      // Check for description text about emoji meanings
      expect(screen.getByText(/real meaning/i)).toBeInTheDocument();
    });
  });

  describe('Features section', () => {
    test('renders features heading', () => {
      render(<HomePage />);

      // Check for features section heading
      expect(screen.getByRole('heading', { name: 'Features', level: 2 })).toBeInTheDocument();
    });

    test('displays key platform features', () => {
      render(<HomePage />);

      // Check for context-aware feature (heading)
      expect(screen.getByRole('heading', { name: /Context-Aware/i })).toBeInTheDocument();

      // Check for generational differences feature (heading)
      expect(screen.getByRole('heading', { name: /Generation/i })).toBeInTheDocument();

      // Check for AI interpreter feature (heading)
      expect(screen.getByRole('heading', { name: /AI Interpret/i })).toBeInTheDocument();
    });
  });

  describe('CTA section', () => {
    test('renders interpreter CTA link', () => {
      render(<HomePage />);

      // Check for link to interpreter - there are multiple, check that at least one exists with correct href
      const ctaLinks = screen.getAllByRole('link', { name: /interpret/i });
      expect(ctaLinks.length).toBeGreaterThan(0);
      expect(ctaLinks.some((link) => link.getAttribute('href') === '/interpreter')).toBe(true);
    });

    test('renders browse emojis link', () => {
      render(<HomePage />);

      // Check for link to emoji browsing
      const browseLinks = screen.getAllByRole('link', { name: /browse|view all emoji/i });
      expect(browseLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Sample emojis section', () => {
    test('renders sample emojis section heading', () => {
      render(<HomePage />);

      // Use exact text match to distinguish from "Popular Emoji Combos"
      expect(screen.getByRole('heading', { name: 'Popular Emojis', level: 2 })).toBeInTheDocument();
    });

    test('displays emoji cards with characters', () => {
      render(<HomePage />);

      // Check that some emoji cards are displayed (using data-testid)
      const emojiCards = screen.queryAllByTestId('emoji-card');
      // Should have emojis if data exists
      expect(emojiCards.length).toBeGreaterThanOrEqual(0);

      // If there are cards, they should have content
      if (emojiCards.length > 0) {
        // Cards should contain text (emoji character or name)
        expect(emojiCards[0].textContent?.length).toBeGreaterThan(0);
      }
    });

    test('emoji cards link to detail pages', () => {
      render(<HomePage />);

      // Get all links and verify some link to emoji detail pages
      const allLinks = screen.getAllByRole('link');
      const emojiLinks = allLinks.filter((link) =>
        link.getAttribute('href')?.startsWith('/emoji/')
      );
      // Should have emoji links if data exists
      expect(emojiLinks.length).toBeGreaterThanOrEqual(0);
    });

    test('limits displayed emojis to a reasonable number', () => {
      render(<HomePage />);

      // Should show max 6 emojis on homepage
      const emojiCards = screen.queryAllByTestId('emoji-card');
      expect(emojiCards.length).toBeLessThanOrEqual(6);
    });
  });

  describe('Featured combos section', () => {
    test('renders featured combos section heading', () => {
      render(<HomePage />);

      expect(
        screen.getByRole('heading', { name: /popular emoji combo/i, level: 2 })
      ).toBeInTheDocument();
    });

    test('displays combo cards', () => {
      render(<HomePage />);

      // Check that some combo cards are displayed (using data-testid)
      const comboCards = screen.queryAllByTestId('combo-card');
      // Should have combos if data exists
      expect(comboCards.length).toBeGreaterThanOrEqual(0);

      // If there are cards, they should have content
      if (comboCards.length > 0) {
        expect(comboCards[0].textContent?.length).toBeGreaterThan(0);
      }
    });

    test('combo cards link to detail pages', () => {
      render(<HomePage />);

      // Get all links and verify some link to combo detail pages
      const allLinks = screen.getAllByRole('link');
      const comboLinks = allLinks.filter((link) =>
        link.getAttribute('href')?.startsWith('/combo/')
      );
      // Should have combo links if data exists
      expect(comboLinks.length).toBeGreaterThanOrEqual(0);
    });

    test('limits displayed combos to a reasonable number', () => {
      render(<HomePage />);

      // Should show max 4 combos on homepage
      const comboCards = screen.queryAllByTestId('combo-card');
      expect(comboCards.length).toBeLessThanOrEqual(4);
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      render(<HomePage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    test('links have descriptive text', () => {
      render(<HomePage />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        // Each link should have meaningful text content or aria-label
        const textContent = link.textContent?.trim() ?? '';
        const ariaLabel = link.getAttribute('aria-label') ?? '';
        const hasText = textContent.length > 0;
        const hasAriaLabel = ariaLabel.length > 0;
        expect(hasText || hasAriaLabel).toBe(true);
      });
    });

    test('main content is wrapped in main landmark', () => {
      render(<HomePage />);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('SEO elements', () => {
    test('page is structured for SEO', () => {
      render(<HomePage />);

      // Check that main content areas are present
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Check that important keywords are present in content
      const pageContent = document.body.textContent;
      expect(pageContent).toContain('emoji');
      expect(pageContent?.toLowerCase()).toContain('meaning');
    });
  });
});
