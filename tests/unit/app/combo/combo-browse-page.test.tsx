import { describe, test, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import ComboBrowsePage, { generateMetadata } from '@/app/combo/page';

afterEach(() => {
  cleanup();
});

describe('ComboBrowsePage', () => {
  describe('Page rendering', () => {
    test('renders the page title', () => {
      render(<ComboBrowsePage />);
      expect(screen.getByRole('heading', { level: 1, name: /emoji combos/i })).toBeInTheDocument();
    });

    test('renders header and footer', () => {
      render(<ComboBrowsePage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    test('displays combo count in description', () => {
      render(<ComboBrowsePage />);
      // Should have text mentioning combo count
      expect(screen.getByText(/discover.*emoji combination/i)).toBeInTheDocument();
    });

    test('renders category navigation', () => {
      render(<ComboBrowsePage />);
      // Should have category links
      const categoryLinks = screen.getAllByRole('link');
      expect(categoryLinks.length).toBeGreaterThan(0);
    });

    test('renders combo cards', () => {
      render(<ComboBrowsePage />);
      // Should render combo cards if data exists
      const comboLinks = screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('href')?.match(/^\/combo\/[^/]+$/));
      expect(comboLinks.length).toBeGreaterThan(0);
    });

    test('renders category sections with headings', () => {
      render(<ComboBrowsePage />);
      // Should have category section headings
      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });
  });

  describe('Metadata generation', () => {
    test('generateMetadata returns proper title', () => {
      const metadata = generateMetadata();
      expect(metadata.title).toContain('Combo');
    });

    test('generateMetadata returns proper description', () => {
      const metadata = generateMetadata();
      expect(metadata.description).toContain('emoji');
    });

    test('generateMetadata includes canonical URL', () => {
      const metadata = generateMetadata();
      expect(metadata.alternates?.canonical).toContain('/combo');
    });

    test('generateMetadata includes OpenGraph data', () => {
      const metadata = generateMetadata();
      expect(metadata.openGraph?.title).toBeDefined();
      expect(metadata.openGraph?.description).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      render(<ComboBrowsePage />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    test('combo links have aria-labels', () => {
      render(<ComboBrowsePage />);
      const comboLinks = screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('href')?.match(/^\/combo\/[^/]+$/));

      if (comboLinks.length > 0) {
        comboLinks.forEach((link) => {
          expect(link).toHaveAttribute('aria-label');
        });
      }
    });
  });
});
