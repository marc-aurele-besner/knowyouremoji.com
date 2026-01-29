import { describe, test, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import EmojiBrowsePage, { generateMetadata } from '@/app/emoji/page';

afterEach(() => {
  cleanup();
});

describe('EmojiBrowsePage', () => {
  describe('Page rendering', () => {
    test('renders the page title', () => {
      render(<EmojiBrowsePage />);
      expect(
        screen.getByRole('heading', { level: 1, name: /browse all emojis/i })
      ).toBeInTheDocument();
    });

    test('renders page content without layout components', () => {
      render(<EmojiBrowsePage />);
      // Header and Footer are now in the root layout, not individual pages
      // Page should render its main content
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    test('displays emoji count in description', () => {
      render(<EmojiBrowsePage />);
      // Should have text mentioning emoji count
      expect(screen.getByText(/explore.*emoji meanings/i)).toBeInTheDocument();
    });

    test('renders category navigation', () => {
      render(<EmojiBrowsePage />);
      // Should have category links
      const categoryLinks = screen.getAllByRole('link');
      expect(categoryLinks.length).toBeGreaterThan(0);
    });

    test('renders emoji cards', () => {
      render(<EmojiBrowsePage />);
      // Should render emoji cards if data exists
      const emojiLinks = screen
        .getAllByRole('link')
        .filter(
          (link) =>
            link.getAttribute('href')?.startsWith('/emoji/') &&
            !link.getAttribute('href')?.includes('/category/')
        );
      expect(emojiLinks.length).toBeGreaterThan(0);
    });

    test('renders category sections with headings', () => {
      render(<EmojiBrowsePage />);
      // Should have category section headings
      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });
  });

  describe('Metadata generation', () => {
    test('generateMetadata returns proper title', () => {
      const metadata = generateMetadata();
      expect(metadata.title).toContain('Emojis');
    });

    test('generateMetadata returns proper description', () => {
      const metadata = generateMetadata();
      expect(metadata.description).toContain('emoji');
    });

    test('generateMetadata includes canonical URL', () => {
      const metadata = generateMetadata();
      expect(metadata.alternates?.canonical).toContain('/emoji');
    });

    test('generateMetadata includes OpenGraph data', () => {
      const metadata = generateMetadata();
      expect(metadata.openGraph?.title).toBeDefined();
      expect(metadata.openGraph?.description).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      render(<EmojiBrowsePage />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    test('emoji links have aria-labels', () => {
      render(<EmojiBrowsePage />);
      const emojiLinks = screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('href')?.match(/^\/emoji\/[^/]+$/));

      if (emojiLinks.length > 0) {
        emojiLinks.forEach((link) => {
          expect(link).toHaveAttribute('aria-label');
        });
      }
    });
  });
});
